#!/bin/bash

echo "🚀 Démarrage du projet Travaux Routiers"
echo "======================================"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Nettoyer les anciens conteneurs si nécessaire
echo "🧹 Nettoyage des anciens conteneurs..."
docker-compose down --remove-orphans

# Construire et démarrer tous les services
echo "🏗️  Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "📋 État des services:"
docker-compose ps

echo ""
echo "✅ Projet démarré avec succès!"
echo ""
echo "📌 URLs disponibles:"
echo "   • Frontend (React):  http://localhost:3000"
echo "   • Backend (API):     http://localhost:8080"
echo "   • Swagger UI:        http://localhost:8080/swagger-ui.html"
echo "   • PgAdmin:           http://localhost:5050"
echo "   • Base de données:   localhost:5432"
echo ""
echo "🔑 Credentials PgAdmin:"
echo "   • Email: admin@travaux-routiers.mg"
echo "   • Password: admin123"
echo ""
echo "💡 Pour arrêter: docker-compose down"