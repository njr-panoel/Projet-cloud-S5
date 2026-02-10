-- Migration: Ajouter les colonnes de suivi d'avancement aux signalements
-- Date: 2024
-- Description: Ajoute date_nouveau, date_en_cours, date_termine pour le calcul d'avancement

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS date_nouveau TIMESTAMP;
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS date_en_cours TIMESTAMP;
ALTER TABLE signalements ADD COLUMN IF NOT EXISTS date_termine TIMESTAMP;

-- Mettre à jour les signalements existants avec les dates appropriées
-- Pour les signalements NOUVEAU, on initialise date_nouveau avec created_at
UPDATE signalements 
SET date_nouveau = created_at 
WHERE date_nouveau IS NULL;

-- Pour les signalements EN_COURS, on initialise aussi date_en_cours
UPDATE signalements 
SET date_en_cours = COALESCE(updated_at, created_at)
WHERE statut = 'EN_COURS' AND date_en_cours IS NULL;

-- Pour les signalements TERMINE, on initialise date_termine
UPDATE signalements 
SET date_termine = COALESCE(completed_at, updated_at, created_at),
    date_en_cours = COALESCE(date_en_cours, created_at)
WHERE statut = 'TERMINE' AND date_termine IS NULL;

-- Vérification
SELECT 
    id, 
    titre, 
    statut, 
    date_nouveau, 
    date_en_cours, 
    date_termine,
    CASE 
        WHEN statut = 'NOUVEAU' THEN 0
        WHEN statut = 'EN_COURS' THEN 50
        WHEN statut = 'TERMINE' THEN 100
        ELSE 0
    END as avancement
FROM signalements;
