# Changelog

## Version actuelle

### [Version 3.1] - 2025-05-16

Version finale, Documentation mise à jour, tests en local effectués.
L'application est fonctionnelle, interagit avec Pinata d'un côté pour le stockage des images et des métadonnées de NFT, et de l'autre avec le contrat et les comptes utilisateurs via Metamask et ether.js.


## Versions précédentes 

### [Version 3] - 2025-05-12

#### Nouvelles fonctionnalités
- [Ajout] Ajout des champs Nom et Description dans le formulaire de mint
- [Ajout] Nouveau système de mint en intégrant IPFS :
    - [Ajout] Création d'un fichier de métadonnées et stockake sur IPFS via Pinata : le NFT est créé avec le CID de ce fichier
    - [Ajout] Possibilité de créer un NFT en fournissant un fichier image .png / .webp / .jpeg depuis sa machine 
        - [Ajout] Le fichier image fourni est stocké sur IPFS et son CID est utilisé automatiquement dans la création du fichier de métadonnées
    - [Ajout] Possibilité de créer un NFT en fournissant directement un CID d'image stockée sur IPFS.
- [Modification] Modification de nombreux messages d'erreur et retour utilisateur pour améliorer le système de feedback.

#### Documentation
- [Mise à jour] Fichier README
- [Mise à Jour] Fichier darkduck-dapp/package.json 
     

### [Version 2.3] - 2025-04-24

#### Nouvelles fonctionnalités 
- [Ajout] Fonctionnalité de suppression d'un NFT par le contract owner
- [Ajout] Page Admin uniquement accessible et visible par le contract owner
    - [Ajout] Récupération des frais de transaction accumulés
    - [Ajout] Changement de l'adresse du collecteur de frais de transaction
    - [Ajout] Changement du pourcentage des frais de transaction appliqués
- [Ajout] Fonction pour récupérer les frais de transaction accumulés dans le contract en Solidity

#### Documentation
- [Mise à jour] Fichier README

### [Version 2.2] - 2025-04-23

#### Nouvelles fonctionnalités
- [Correction] Bouton retirer de la vente avait disparu, il est revenu
- [Ajout] Obligation de connexion pour afficher le form pour mint
- [Ajout] Possibilité de burn un NFT seulement pour le Contract Owner

- [Ajout] Fonction burn dans le contract en Solidity + les tests associés

#### Documentation
- [Mise à jour] Fichier README

### [Version 2.1] - 2025-04-21

#### Nouvelles fonctionnalités 
- [Ajout] front end fonctionnel avec les features suivantes
    - [Ajout] Bouton pour mint un NFT - autorisé seulement au propriétaire du contrat
    - [Ajout] Gallery globale pour afficher tous les NFT existants
    - [Ajout] Gallery personnelle pour afficher seulement les NFT possédés par le compte connecté
        - [Ajout] Fonctionnalités de mise en vente, transfert d'un NFT
        - [Ajout] Fonctionnalité d'affichage dans un nouvel onglet des métadonnées d'un NFT
    - [Ajout] Marketplace pour visualiser les NFTs en vente et leur prix et acheter des NFT
    - [Ajout] Page About
- [Ajout] NFT minted avec fichiers .json contenant des métadonnées et stockés en local dans le répertoire [metadata](darkduck-dapp/public/metadata)


#### Documentation 
- [Mise à jour] Fichiers README et INSTALL


### [Version 2.0] - 2025-04-17

#### Nouvelles fonctionnalités
- [Ajout] début du frontend avec Next.js
- [Ajout] possibilité de connecter son portefeuille metamask
- [Ajout] possibilité de mint un NFT lorsque connecté avec compte owner sur metamask

#### Documentation
- [Mise à jour] README et INSTALL.md avec nouvelle procédure pour la dApp

### [Version 1.0] - 2025-04-10

#### Nouvelles fonctionnalités
- [Ajout] Contrat ERC-721 complet : mint, vente, achat, transfert
- [Ajout] Frais de plateforme configurables avec withdrawFunds()
- [Ajout] Event NFTMinted(...) et FundsWithdrawn(...) pour interopérabilité
- [Ajout] Script de déploiement via Hardhat
- [Ajout] Suite complète de tests avec Hardhat

#### Documentation
- [Ajout] Commentaires NatSpec sur toutes les fonctions
- [Mise à jour] README et INSTALL.md

#### [Version 0.1] - 2025-03-13

Compréhension initiale du projet :
- Concepts : blockchain, consensus, NFT, Ethereum, IPFS
- Setup de l'environnement Hardhat
- Organisation de base du projet (dossiers, templates)
