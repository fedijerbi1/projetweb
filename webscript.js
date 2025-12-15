const totalQuestions = 5;  
let currentIndex = 0;

const AI_API_CONFIG = {
    gemini: {
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        key: 'AIzaSyBIakx1YIcVtQnnrclficvzZrkHHMPVUVA',
        model: 'gemini-2.5-flash'
    }
};


const destinations = {
    barcelone: { name: "Barcelone", description: "La Ville Lumière avec ses monuments emblématiques" },
    tokyo: { name: "Tokyo", description: "Mélange de tradition et modernité" },
    Santorin: { name: "Santorin", description: "Île grecque célèbre pour ses couchers de soleil" },
    istanbul: { name: "Istanbul", description: "Ville historique au carrefour de l'Europe et de l'Asie" },
    costarica: { name: "Costa_Rica", description: "Nature luxuriante et biodiversité" },
    patagonie: { name: "Patagonie", description: "Paysages sauvages et nature préservée" }, 
    florence: { name: "Florence", description: "Berceau de la Renaissance et art exceptionnel" },
    islande: { name: "Islande", description: "Paysages volcaniques et aurores boréales" }
};

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    
    function updateProgress() { 
        if (progressBar && progressText) {
            const progress = ((currentIndex + 1) / totalQuestions) * 100;
            progressBar.style.width = progress + '%'; 
            progressText.innerText = 'Question ' + (currentIndex + 1) + ' sur ' + totalQuestions; 
        }
    }
    
   
    updateProgress();
    
    
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const answers = {
                budget: formData.get('budget'),
                experience: formData.get('experience'),
                cuisine: formData.get('cuisine'),
                climat: formData.get('climat'),
                passion: formData.get('passion')
            };
            
            console.log('Réponses:', answers);
            
            if (!answers.budget || !answers.experience || !answers.cuisine || !answers.climat || !answers.passion) {
             swal.fire({
                icon :'error' , 
                text:'Veuillez répondre à toutes les questions !' , 
                confirmButtonText:'Fermer'
             })
                return;
            }
            
            getAIRecommendations(answers);
        });
    }
    
    // Détecter les changements de radio buttons pour mettre à jour la progression
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    let answeredQuestions = new Set();
    
    radioButtons.forEach(function(radio) {
        radio.addEventListener('change', function() {
            answeredQuestions.add(this.name);
            currentIndex = answeredQuestions.size - 1;
            updateProgress();
        });
    });
});

// Fonction pour obtenir les recommandations IA
function getAIRecommendations(answers) {
    const apiConfig = AI_API_CONFIG.gemini;
    
   Swal.fire({
                title: 'Analyse en cours...',
                html: 'L\'IA analyse vos préférences',
                allowOutsideClick: false,
                didOpen: function() {
                    Swal.showLoading();
                }
            });
    
    const requestData = {
        contents: [{
            parts: [{
                text: `Tu es un expert en voyages. Recommande 3 destinations parmi: barcelone, tokyo, santorin, istanbul, costarica, patagonie, florence, islande.

Profil de l'utilisateur:
- Budget: ${answers.budget}
- Expérience recherchée: ${answers.experience}
- Cuisine préférée: ${answers.cuisine}
- Climat préféré: ${answers.climat}
- Passion: ${answers.passion}

Réponds UNIQUEMENT avec 3 destinations séparées par des virgules (exemple: barcelone,tokyo,santorin). Rien d'autre.`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
        }
    };
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiConfig.url}?key=${apiConfig.key}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 15000;
    
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            
                const data = JSON.parse(xhr.responseText);
                processAIResponse(data);
            }
                
            
         else {
            alert(` Erreur API ${xhr.status}`);
        }
    };
    
    xhr.onerror = function() {
        alert(' Erreur réseau');
    };
    
    xhr.ontimeout = function() {
        alert(' Délai dépassé (15 secondes)');
    };
    
    xhr.send(JSON.stringify(requestData));
}

// Traiter la réponse de l'IA
function processAIResponse(response) {
        const text = response.candidates[0].content.parts[0].text.trim(); 
        
        
        const destNames = text.split(',').map(d => d.trim().toLowerCase());
        
        
        
        if (destNames.length > 0) {
            let message = ' VOS DESTINATIONS RECOMMANDÉES:\n\n'; 
            for (let i =0 ; i<destNames.length ;i++ ) { 
             
              if (!destinations[destNames[i]]) continue;
                const dest = destinations[destNames[i]];
                const reason = dest.description;
                
                message += `
                    <div style="
                        text-align: left; 
                        margin: 15px 0; 
                        padding: 15px; 
                        background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%);
                        border-radius: 8px;
                        border-left: 4px solid #2d6a4f;
                    ">
                        <div style="font-size: 20px; margin-bottom: 8px;">
                             <strong>${dest.name}</strong> 
                             <a href="${dest.name}.html" style="font-size: 14px; margin-left: 10px; color: #1d3557; text-decoration: underline;">En savoir plus</a>
                        </div>
                        
                        <div style="color: #666;">
                            ${reason}
                        </div>
                    </div>
                `; 
            }
        Swal.fire({ 
            html : message ,  
            icon:"success" , 
             confirmButtonText: 'OK' , 
             width : 600
            });
        } else {
            Swal.fire({ 
                icon:'error' , 
                text:'Aucune destination valide trouvée',
                confirmButtonText : 'Fermer'
            })
        }
    
}
