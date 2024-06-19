[merkletreejs](../README.md) › [Globals](../globals.md) › ["src/MerklePatricia"](../modules/_src_merklepatricia_.md) › [MerklePatricia](_src_merklepatricia_.merklepatricia.md)

# Class: MerklePatricia

## Hierarchy

* **MerklePatricia**

## Index

### Constructors

* [constructor](_src_merklepatricia_.merklepatricia.md#constructor)

### Accessors

* [rootHash](_src_merklepatricia_.merklepatricia.md#roothash)

### Methods

* [generateProof](_src_merklepatricia_.merklepatricia.md#generateproof)
* [get](_src_merklepatricia_.merklepatricia.md#get)
* [put](_src_merklepatricia_.merklepatricia.md#put)
* [verifyProof](_src_merklepatricia_.merklepatricia.md#verifyproof)

## Constructors

###  constructor

\+ **new MerklePatricia**(): *[MerklePatricia](_src_merklepatricia_.merklepatricia.md)*

**Returns:** *[MerklePatricia](_src_merklepatricia_.merklepatricia.md)*

## Accessors

###  rootHash

• **get rootHash**(): *string*

**Returns:** *string*

## Methods

###  generateProof

▸ **generateProof**(`key`: string): *any[]*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any[]*

___

###  get

▸ **get**(`key`: string): *string | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *string | null*

___

###  put

▸ **put**(`key`: string, `value`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | string |

**Returns:** *void*

___

###  verifyProof

▸ **verifyProof**(`rootHash`: string, `key`: string, `proof`: any[]): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`rootHash` | string |
`key` | string |
`proof` | any[] |

**Returns:** *boolean*
