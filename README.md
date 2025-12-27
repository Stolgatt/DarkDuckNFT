# NFT - Rubber Ducks (DarkDuckNFT)

## Auteurs

- Développeur : Alexis CHAVY
- Professeur encadrant : François CHAROY

## Description

Projet éducatif de blockchain visant à développer une plateforme de création et d'échange de NFTs de Rubber Ducky.

Ce projet s'appuie sur la norme ERC-721 et intègre un système de mise en vente, achat, gestion des frais de plateforme, et un contrôle d'accès sécurisé. Il prépare également l’intégration d’IPFS pour l’hébergement des images et métadonnées.

Le contrat a été intégralement développé en Solidity et testé localement avec Hardhat.

**Remarque**: contrairement à de "vrais" NFT où il n'est pas possible de créer plus d'une instance d'un NFT, avec DarkDuck NFT, c'est autorisé !
Quoi de mieux que de multiplier les canards, même s'ils se ressemblent un peu ?
(Cependant, chaque NFT a bien un ID différent, ce ne sont pas complètement des clones...)

Le projet a pour objectifs :
- De mettre en œuvre un **contrat intelligent ERC-721**.
- De créer une **interface Web3** permettant la création, la vente et l’achat de NFT.
- D’explorer l’utilisation de **IPFS (via Pinata)** pour l’hébergement décentralisé des métadonnées.
- De comprendre les mécanismes de contrôle d’accès, de gestion de frais et de déploiement local.

Le projet est développé en Solidity (backend) et Next.js (frontend), avec un outillage basé sur Hardhat, Ethers.js, Tailwind CSS et Metamask.

## Fonctionnalités principales de l'application

### Côté administrateur (owner)

- Mint de NFT avec métadonnées (IPFS)
- Définition des frais de plateforme (jusqu'à 10%)
- Retrait des frais collectés
- Suppression de NFT
- Page d’administration dédiée

### Côté utilisateur

- Connexion via Metamask
- Galerie globale (tous les NFTs)
- Galerie personnelle
- Mint avec image locale ou CID IPFS
- Mise en vente / Retrait de la vente
- Achat de NFT
- Visualisation des métadonnées

### Comportement UX

- Messages de transaction
- Blocages fonctionnels si le wallet ne remplit pas les conditions
- Affichage des erreurs (encore à améliorer en cas de rejet Metamask)

## Installation et Utilisation

Consultez le fichier [INSTALL.md](INSTALL.md) pour les instructions détaillées.

## Intégration IPFS

### Objectif

Assurer que les images et métadonnées des NFT soient hébergées de manière décentralisée.

### Utilisation de Pinata

[Voir section concernant Pinata dans le fichier INSTALL.md]

### Fonctionnement

- L’utilisateur peut uploader un fichier image (jpeg/png/webp)
- Le fichier est envoyé sur IPFS via l’API Pinata
- Un fichier `.json` de métadonnées est généré avec le lien IPFS de l’image
- Le fichier `.json` des métadonnées est stocké sur IPFS via l'API Pinata
- Le CID du fichier `.json` est utilisé comme URI du NFT

### Exemple d’URI (créé automatiquement via le formulaire de Mint)

```json
{
  "name": "Duck #42",
  "description": "Un canard qui aime débugger du Solidity",
  "image": "ipfs://bafybeif.../duck42.png"
}
```

## Conditions d'utilisation 

- La création d'un NFT est exclusivement réservée à l'utilisateur qui déploie le contrat
- Lors de la création d'un NFT, un nom, une description et une image (sous format png, jpeg ou webp uploadée depuis le PC OU via un CID d'une image stockée via IPFS) sont nécéssaires. La description a une longueur maximale de 255 caractères et le nom 100 caractères.


## Bugs et Erreurs connus :

### Achat échoué après tentative précédente

- **Problème** : Un utilisateur n’arrivant pas à acheter un NFT faute de fonds reste bloqué ensuite même avec un compte solvable. (bug non reproduit par la suite mais apparition possible)
- **Hypothèse** : état mal réinitialisé côté frontend.

### Rejet Metamask non géré

- **Problème** : Rejet d’une transaction dans Metamask, lors d'un mint de NFT, provoque une erreur non attrapée.
- **Impact** : Erreur non user-friendly dans l’interface.

## TODO (Etapes futures)

- Déploiement sur testnet (e.g., Sepolia) et tests complets **(requiert des fonds Etherum réels, les tests sont repoussés jusqu'à découverte d'une solution gratuite)**