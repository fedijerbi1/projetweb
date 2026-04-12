const totalQuestions = 5;
let currentIndex = 0;

const BACKEND_API_URL = 'http://localhost:3000/api/recommendations';

const destinations = {
    barcelone: { name: 'Barcelone', description: 'La Ville Lumiere avec ses monuments emblematiques' },
    tokyo: { name: 'Tokyo', description: 'Melange de tradition et modernite' },
    santorin: { name: 'Santorin', description: 'Ile grecque celebre pour ses couchers de soleil' },
    istanbul: { name: 'Istanbul', description: 'Ville historique au carrefour de l Europe et de l Asie' },
    costarica: { name: 'Costa Rica', description: 'Nature luxuriante et biodiversite' },
    patagonie: { name: 'Patagonie', description: 'Paysages sauvages et nature preservee' },
    florence: { name: 'Florence', description: 'Berceau de la Renaissance et art exceptionnel' },
    islande: { name: 'Islande', description: 'Paysages volcaniques et aurores boreales' }
};

document.addEventListener('DOMContentLoaded', function () {
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const quizForm = document.getElementById('quiz-form');
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    let answeredQuestions = new Set();

    function updateProgress() {
        if (!progressBar || !progressText) return;

        const shownIndex = Math.max(0, currentIndex + 1);
        const progress = (shownIndex / totalQuestions) * 100;
        progressBar.style.width = progress + '%';
        progressText.innerText = 'Question ' + shownIndex + ' sur ' + totalQuestions;
    }

    updateProgress();

    if (quizForm) {
        quizForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(quizForm);
            const answers = {
                budget: formData.get('budget'),
                experience: formData.get('experience'),
                cuisine: formData.get('cuisine'),
                climat: formData.get('climat'),
                passion: formData.get('passion')
            };

            if (!answers.budget || !answers.experience || !answers.cuisine || !answers.climat || !answers.passion) {
                Swal.fire({
                    icon: 'error',
                    text: 'Veuillez repondre a toutes les questions !',
                    confirmButtonText: 'Fermer'
                });
                return;
            }

            getAIRecommendations(answers);
        });
    }

    radioButtons.forEach(function (radio) {
        radio.addEventListener('change', function () {
            answeredQuestions.add(this.name);
            currentIndex = answeredQuestions.size - 1;
            updateProgress();
        });
    });
});

async function getAIRecommendations(answers) {
    Swal.fire({
        title: 'Analyse en cours...',
        html: 'Le backend analyse vos preferences',
        allowOutsideClick: false,
        didOpen: function () {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || ('Erreur backend ' + response.status));
        }

        processAIResponse(data);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            text: error.message || 'Erreur reseau lors de l appel backend',
            confirmButtonText: 'Fermer'
        });
    }
}

function processAIResponse(response) {
    let destNames = [];

    if (Array.isArray(response.recommendations)) {
        destNames = response.recommendations.map(function (d) {
            return String(d).trim().toLowerCase();
        });
    } else if (typeof response.recommendations === 'string') {
        destNames = response.recommendations.split(',').map(function (d) {
            return d.trim().toLowerCase();
        });
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0]) {
        const text = String(response.candidates[0].content.parts[0].text || '').trim();
        destNames = text.split(',').map(function (d) {
            return d.trim().toLowerCase();
        });
    }

    destNames = destNames.filter(function (name) {
        return Boolean(destinations[name]);
    }).slice(0, 3);

    if (destNames.length === 0) {
        Swal.fire({
            icon: 'error',
            text: 'Aucune destination valide trouvee',
            confirmButtonText: 'Fermer'
        });
        return;
    }

    let message = 'VOS DESTINATIONS RECOMMANDEES:<br><br>';

    for (let i = 0; i < destNames.length; i++) {
        const key = destNames[i];
        const dest = destinations[key];

        message +=
            '<div style="text-align:left;margin:15px 0;padding:15px;background:linear-gradient(135deg,#667eea22 0%,#764ba222 100%);border-radius:8px;border-left:4px solid #2d6a4f;">' +
                '<div style="font-size:20px;margin-bottom:8px;">' +
                    '<strong>' + dest.name + '</strong>' +
                    '<a href="' + dest.name + '.html" style="font-size:14px;margin-left:10px;color:#1d3557;text-decoration:underline;">En savoir plus</a>' +
                '</div>' +
                '<div style="color:#666;">' + dest.description + '</div>' +
            '</div>';
    }

    Swal.fire({
        html: message,
        icon: 'success',
        confirmButtonText: 'OK',
        width: 600
    });
}
