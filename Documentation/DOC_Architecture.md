# Architecture du projet

## Structure des dossiers

```
DarkDuckNFT/
├── darkduck-dapp/         # Frontend (Next.js)
│   ├── public/            # Images, favicon...
│   ├── src/
│   │   ├── app/           # Pages de l'application
│   │   ├── components/    # Composants React et API
│   │   ├── styles/        # Styles CSS (Tailwind)
│   │   ├── utils/         # Fonctions utilitaires (Ethers.js)
│   │   └── abi/           # ABI du smart contract
|   ├── .env               # Fichier environnement nécéssaire à la communication avec Pinata pour le stockage avec IPFS (à créer et configurer)
|   └── package.json       # Fichier des dépendences à installer avec npm install
├── src/
│   ├── contracts/         # Contrat Solidity (DarkDuckNFT.sol)
│   ├── scripts/           # Script de déploiement du Contrat
│   └── tests/             # Tests avec Hardhat
├── Documentation/
|   ├── DOC_Architecture.md                     # Aperçu de l'organisation des fichiers du projet
│   ├── DOC_Changelog.md                        # Versions et mises à jours passées de l'application
│   ├── INSTALL.md                              # Guide d'installation et démarrage de l'application
│   ├── README.md                               # Informations générales sur l'application et ses versions
│   ├── Specification_Contrat_DarkDuckNFT.md    # Spécification du Smart Contract de l'application
│   ├── Norme_ERC-721.md                        # Informations sur la norme ERC-721 utilisée pour le Smart Contrat
|   └── Sujet.pdf                               # Sujet du projet
├── hardhat.config.js
```

## Technologies principales

- **Solidity** (Contrat)
- **Hardhat** (compilation, tests, déploiement)
- **Ethers.js** (interaction frontend/contrat)
- **Next.js** (dApp frontend)
- **Metamask** (connexion wallet)
- **Pinata/IPFS** (stockage des métadonnées NFT)
