# Projet Web — Commandes Git

## Installation Git
https://git-scm.com/downloads ou // terminale : Avec winget (Windows 10/11) : winget install --id Git.Git -e

## Config (une seule fois)
git config --global user.name "TonNom"
git config --global user.email "ton-email"

## Cloner le projet
git clone https://github.com/fedijerbi1/projetweb.git
cd projetweb

## Créer/aller dans une branche
git checkout -b nom-branche

## Ajouter + Commit (sauvegarder modifications)
git add .
git commit -m "message"

## Envoyer (push)
git push origin nom-branche

## Récupérer les mises à jour (pull)
git pull origin main

## Ouvrir une Pull Request
→ Sur GitHub (onglet **Pull Request**)
