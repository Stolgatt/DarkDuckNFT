# Norme ERC-721

## Description générale

Il s'agit d'une norme concernant les NFT (Non-Fongible Tokens), qui sont des tokens (des biens virtuels) uniques et non divisibles.
Chaque NFT est donc différent et non-interchangeable. Un NFT a donc une description, un identifiant et un propriétaire, entre autres informations.


## Propriétés du standard ERC-721

**Unicité** : chaque NFT aura son propre identifiant unique.
**Transférabilité** : un NFT peut être transféré à un autre utilisateur.
**Possession** : Un NFT est lié à une adresse unique (celle d’un utilisateur) et stocké sur la blockchain spécifique utilisée pour ce type de NFT.
**Métadonnées** : Un NFT peut stocker des informations (nom, description, date de création, image...)
**Interopérabilité** : Un NFT respectant la norme ERC-721 peut être utilisé sur plusieurs plateformes acceptant cette norme.

## Fonctionnalités principales d'un système NFT

**Création d'un NFT (MINTING)** :
Tout utilisateur peut créer son propre NFT sur la blockchain en utilisant la fonction mintNFT du smart contract

-> Cette fonction va créer un nouvel NFT, dont le propriétaire sera le créateur. Elle va lui attacher à la fois un identifiant unique, mais aussi
toutes les métadonnées nécéssaires.

**Mise en vente d'un NFT** :
Le propriétaire et gestionnaire d'un NFT peut choisir de le mettre en vente en spécifiant un prix.

Le smart contrat devra fournir une fonction listForSale(tokenID, price) que le propriétaire devra appeler pour ajouter son NFT à la liste des NFT en vente.
Le NFT sera alors mis en vente et tout acheteur pourra en prendre possession en versant le prix demandé.

**Achat d'un NFT** : 
Tout utilisateur peut choisir d'acheter un NFT mis en vente susr la blockchain en payant son prix.

Le fonctionnement est le suivant :
    - L'acheteur envoie l'argent au smart contract
    - Le smart contract vérifie que le montant est exact
    - Il trasnfert la propriété du NFT à l'acheteur
    - Il envoie l'argent au vendeur.

**Transfert d'un NFT** : 
Un propriétaire et gestionnaire d'un NFT peut transférer de lui même la propriété d'un NFT à un autre utilisateur.

Le propriétaire appelle la fonction transfertNFT(destinataire, tokenID) du smart contract
La blockchain enregistre le nouveau propriétaire.

## Les rôles des utilisateurs

Chaque utilisateur de la blockchain peut donc être dans chacun de ces trois rôles :

**Vendeur**
    - Possède un NFT
    - Peut décider de le vendre
    - Peut définir un prix
**Acheteur**
    - Peut consulter les NFT en vente
    - Peut acheter un NFT en envoyant de l'argent au contrat
**Propriétaire**
    - Détient un NFT
    - Peut le vendre, l'offir ou le garder


## Registre des NFT

La blockchain comporte un registre décentralisé qui contient l'ensemble des NFT créés (donc leur tokendID) et l'adresse blockchain associée à leur propriétaire.

Exemple :
```
    {
    "NFTs": [
        {
        "tokenId": 1,
        "owner": "0xABC123"
        },
        {
        "tokenId": 2,
        "owner": "0xDEF456"
        }
    ]
    }
```

-> En créant sa propre Blockchain, il faudra un contrat permettant la création de NFT et son enregistrement sur le registre de la blockchain
