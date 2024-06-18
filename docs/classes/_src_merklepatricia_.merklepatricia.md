[merkletreejs](../README.md) › [Globals](../globals.md) › ["src/MerklePatricia"](../modules/_src_merklepatricia_.md) › [MerklePatricia](_src_merklepatricia_.merklepatricia.md)

# Class: MerklePatricia

## Hierarchy

* **MerklePatricia**

## Index

### Constructors

* [constructor](_src_merklepatricia_.merklepatricia.md#constructor)

### Properties

* [root](_src_merklepatricia_.merklepatricia.md#root)

### Methods

* [generateProof](_src_merklepatricia_.merklepatricia.md#generateproof)
* [get](_src_merklepatricia_.merklepatricia.md#get)
* [insert](_src_merklepatricia_.merklepatricia.md#insert)
* [verifyProof](_src_merklepatricia_.merklepatricia.md#verifyproof)

## Constructors

###  constructor

\+ **new MerklePatricia**(): *[MerklePatricia](_src_merklepatricia_.merklepatricia.md)*

**Returns:** *[MerklePatricia](_src_merklepatricia_.merklepatricia.md)*

## Properties

###  root

• **root**: *[Node](_src_merklepatricia_.node.md)*

## Methods

###  generateProof

▸ **generateProof**(`key`: string): *[Node](_src_merklepatricia_.node.md)[]*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *[Node](_src_merklepatricia_.node.md)[]*

___

###  get

▸ **get**(`key`: string): *string | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *string | null*

___

###  insert

▸ **insert**(`key`: string, `value`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | string |

**Returns:** *void*

___

###  verifyProof

▸ **verifyProof**(`rootHash`: string, `key`: string, `proof`: [Node](_src_merklepatricia_.node.md)[]): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`rootHash` | string |
`key` | string |
`proof` | [Node](_src_merklepatricia_.node.md)[] |

**Returns:** *boolean*
