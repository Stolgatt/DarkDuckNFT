# Maquette du contrat régissant le DarkDuckNFT


## Spécification des DarkDuckNFT

Métadonnées d'un DarkDuckNFT

- Token ID : identifiant unique du NFT
- Propriétaire : adresse etherum du détenteur 
- Nom
- Description
- URL Image : URL stockée sur IPFS
- Prix : prix dans la devise de la blockchain lors de sa mise en vente

## Héritage

__**Ownable**__ de la librairie OpenZeppelin

**But** : Permet de spécifier des fonctions accessibles uniquement au propriétaire du contrat (celui qui déploie l'application).

**Fonctionnalités** :
    Le propriétaire du contrat est géré dans une variable owner via la librairie Ownable.

    Les fonctions marquées avec le modificateur onlyOwner ne peuvent être appelées que par l'adresse stockée dans owner.

    Le propriétaire peut transférer la propriété du contrat à une autre adresse via la fonction transferOwnership(address newOwner).

```
    import "@openzeppelin/contracts/access/Ownable.sol";
```

__**ERC721**__ et __**ERC721URIStorage**__ d'OpenZeppelin

**But** : Ces contrats permettent de créer un token non fongible (NFT) respectant la norme ERC721. ERC721 définit la structure de base pour gérer des NFT sur la blockchain, en particulier l'attribution de l'ID du token et la gestion de la propriété.

**Fonctionnalités** :
    ERC721 permet de gérer les bases du contrat de NFT : créer des tokens, transférer des tokens, etc.

    ERC721URIStorage ajoute des fonctionnalités permettant de stocker l'URI des métadonnées associées à chaque NFT. Cela permet de lier chaque NFT à une URL de métadonnées, généralement sur un système décentralisé comme IPFS.

```
    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
```

__**Events**__ pour la gestion des logs

**But** : Utiliser des événements pour suivre les actions importantes dans le contrat, comme les retraits de fonds ou les mises en vente.

**Fonctionnalités** :
    Les événements permettent de suivre les actions en temps réel et peuvent être consultés dans les logs de la blockchain, ce qui est essentiel pour la transparence des transactions.

## Variables du contrat

L'**adresse du collecteur** de frais de transaction
```
    adress public feeCollector 
```

Les **frais de transaction** exprimés en base 10 000
```
    uint256 public platformFee
```

**Statistiques** des frais accumulés 
```
    uint256 public accumulatedFees
```

## Fonctionnalités

**MintDDNFT**

Créer un DDNFT, attribue la propriété à *owner*. 
L'URI stocké est le CID fixé et immuable du fichier IPFS contenant les métadonnées du DDNFT.

```
        function mintDDNFT(address owner, string memory tokenURI) public onlyOwner returns (uint256);
```

Fait appel à  
```
    safeMint(address owner, string memory tokenURI)
```

**IsOwnerOfDDNFT**

Permet de vérifier si l'utilisateur est le propriétaire d'un DDNFT ou non

```
    function isOwnerOfNFT(uint256 tokenId, address user) public view returns (bool);
```


**ListForSale**

Met en vente un DDNFT à un prix donné.
Le prix réel est accru en fonction du taux de frais de transaction de la plateforme.

```
    function listForSale(uint256 tokenID, uint256 price) public;

```

Fait appel à 

```
    approve(address contractAddress, uint256 tokenId)
```

pour approuver la mise en vente.

**UnlistFromSale**

Retire un DDNFT de la vente.

```
    function unlistFromSale(uint256 tokenID) public;
```

**BuyDDNFT**

Permet l'achat d'un DDNFT en envoyant l'argent au vendeur.
Une partie du montant versé est prélevé comme frais de transaction et stocké dans une variable *feeAmount* sur le contrat.

```
    function buyDDNFT(uint256 tokenID) public payable;
```

**TransfertNFT**

Transfert la propriété d'un DDFT à un autre utilisateur (*to*).

```
    function transferNFT(address to, uint256 tokenId) public;
```

**TokenURI**

Renvoie l'URL des métadonnées du DDNFT.

```
    function tokenURI(uint256 tokenId) public view returns (string memory);
```

**SetPlatformFee**

Modifie les frais de la plateforme (par défaut 1000 pour 10%).
*Uniquement accessible au propriétaire*
Limite maximale des frais de transaction : 10%

```
    function setPlatformFee(uint256 newFee) public onlyOwner;
```

Exemple : pour changer les frais de plateforme à 2,5%
```
    setPlatformFee(250)
```

**SetFeeCollector**

Change l'adresse sur la blockchain du collecteur des frais de transaction.
*Uniquement accessible au propriétaire*

```
    function setFeeCollector(address newCollector) public onlyOwner;
```

**WithdrawFunds**

Retire le montant total des frais de transaction accumulés sur le contrat et le transfert sur le compte du *feeCollector*
*Uniquement accessible au propriétaire*

```
    function withdrawFunds() public onlyOwner;
```

Emission d'un évènement pour suivre les retrait des frais dans les logs :
```
    event FundsWithdrawn(address indexed collector, uint256 amount);
```

