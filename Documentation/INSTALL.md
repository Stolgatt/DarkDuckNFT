# INSTALLATION GUIDE - DarkDuckNFT

## Prérequis

Assurez-vous d'avoir les outils suivants installés sur votre machine :

- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [Hardhat](https://hardhat.org/)

Assurez-vous d'avoir un compte :

- [Metamask](https://metamask.io/) (Avec l'extension navigateur (facultatif))
- [Pinata](https://pinata.cloud/)

## Installation du projet

1. **Cloner le dépôt**

```bash
git clone https://gitlab.telecomnancy.univ-lorraine.fr/projets/2425/darkduck25/groupe06.git DarkDuckNFT
cd DarkDuckNFT
```

2. **Installer les dépendances**

Dans le répertoire racine du projet :
```bash
npm install
```

Puis dans le sous-dossier darkduck-dapp situé à la racine du projet : 
```bash
cd darkduck-dapp
npm install
npm install formidable form-data node-fetch
```

3. **Compiler le contrat**

Dans le répertoire racine du projet
```bash
npm run compile
```

## Connexion à Pinata

Pour profiter des fonctionnalités d'IPFS via Pinata, il faut créer un compte sur la plateforme et connecter l'application DarkDuckNFT à ce compte.

### Étapes à suivre

#### Créer un compte Pinata

- Rendez-vous sur https://www.pinata.cloud/ et inscrivez-vous.
- Vérifiez votre adresse e-mail si nécessaire.

#### Créer un Jeton JWT

- Accédez à votre tableau de bord Pinata.
- Allez dans API Keys via le menu utilisateur (partie gauche de l'écran).
- Cliquez sur New Key en haut à droite.
- Donnez un nom (ex. DarkDuck DApp).
- Laissez toutes les permissions par défaut mais cochez à minima **pinFileToIPFS** et **pinJSONToIPFS**.
- Cliquez sur Create.
- Copiez le JWT complet en cliquant sur “Copy All”.

#### Configurer les variables d’environnement

- Dans le sous-dossier [darkduck-dapp](./darkduck-dapp/), créez un fichier .env (s'il n’existe pas déjà).
- Collez le JWT complet et formattez le comme suit : (le mot clé **Bearer** sera sans doute à ajouter)
```bash
API Key: c4cc...
API Secret: 532f...
PINATA_JWT=Bearer eyJhbG....
```

## Déploiement local

1. **Lancer un noeud local Hardhat**

Dans un terminal, dans le répertoire racine du projet :

```bash
npx hardhat node
```

2. **Déployer le contrat**

Dans un autre terminal, sans le répertoire racine du projet :

```bash
npx hardhat run src/scripts/deploy.js --network localhost
```

3. **Démarrer la dApp**

Dans un troisième terminal, dans le sous-dossier darkduck-dapp situé à la racine du projet

```bash
npm run dev
```

Vous êtes maintenant prêt à profiter de l'application

## Utilisation 

### Connexion à Metamask

Vous aurez besoin d'un compte métamask pour tester l'application. 

Si vous voulez tester en local, il faut connecter au moins un compte issu de la blockchain locale.

Pour cela, regardez dans le terminal où vous avez démarrer le noeud de la blockchain 
(commande **npx hardhat node**)

Copiez la clé privée d'un compte, par exemple (différent sur votre machine) :
```bash
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

Ouvrez MetaMask :

- Cliquez sur le sélecteur de réseau et choisissez Localhost 8545 (ajoutez-le si nécessaire).
- Cliquez sur le bouton du compte (en haut à droite), puis Importer un compte.
- Collez la clé privée copiée.
- Répétez si vous voulez importer plusieurs comptes.

#### Remarques :
- Certaines fonctionnalités sont réservées à un compte "administrateur". Il s'agit du compte qui déploie le contrat, soit le compte **Account #0**. Il faudra donc obligatoirement connecter ce compte
- Les 19 autres comptes affichés sont des comptes qui peuvent être utilisés pour faire des achats et plus généralement utiliser l'application en tant qu'utilisateur lambda.
- Chaque compte est doté de 10000 ETH pour les tests.


## Utilisation de l'application

L'application donne accès au travers du contrat à plusieurs fonctionnalités.

### Pour le compte Administrateur (créateur et déployeur du contrat)

- La page **Admin** donne accès aux fonctionnalités suivantes :
    - Changer l'adresse Etherum du compte qui récupèrera les frais de transaction accumulés
    - Changer le taux de frais de transactions (sur une base de 1000 pour 10% (borne maximale))
    - Récupérer les frais de transaction accumulés
- La page **Mint DDNFT** (Bouton vert en haut à droite) donne accès à :
    - La création de nouveaux NFT en renseignant obligatoirement son **Nom**, sa **Description** (max 255 Caractères) et une image (soit locale sur l'appareil de l'utilisateur soir directement via un CID d'image stockée sur IPFS)
    - La visualisation en temps réel du NFT qui va être créé

- Sur les pages affichant les NFT :
    - Possibilité de supprimer un NFT

### Pour tous les utilisateurs

- La page **Gallery** affiche tous les NFT créés, avec leur propriétaire ou la mention **Owned** si vous en êtes le propriétaire
- La page **My Ducks** affiche tous les NFTs possédés par l'utilisateur dont le compte Etherum est actuellement connecté via Metamask.
    -  Cette page donne accès à un menu pour chaque NFT avec les options :
        - **List For Sale** : permet d'entrer un prix en Etherum et de mettre en vente ce NFT. Le bouton **Remove From Sale** apparaitra ensuite pour le retirer de la vente.
        - **Transfer NFT** : permet de rentrer l'adresse publique d'un compte Etherum sur la blockchain et de lui transférer le NFT choisi.
        - **Open Metadata** : permet de visualiser le contenu du fichier `.json` de métadonnées du NFT choisi.
- La page **Marketplace** affiche tous les NFT actuellement en vente (sauf ceux du compte connecté) ainsi que leur prix (frais inlcus) et un bouton pour acheter. Cliquer sur le bouton déclenchera des demandes de confirmation de l'application et de Metamask avant de réellement acheter et posséder le NFT choisi.
- La page **About** affiche une courte description de ce projet et des DarkDuck NFT.
- La page **Create NFT** est accessible mais entièrement bridée pour tout utilisateur autre que le propriétaire.

## Exécution des tests

Pour exécuter l'ensemble de la suite de tests unitaires :

Dans un terminal, à la racine du projet :
```bash
npm run test
```

Les tests couvrent :
- Le déploiement du contrat
- Le mint et la vérification de l'URI
- La mise en vente, l'achat et les transferts
- La gestion des frais et leur retrait

## Structure du projet

Voir fichier [DOC_Architecture](./DOC_Architecture)

