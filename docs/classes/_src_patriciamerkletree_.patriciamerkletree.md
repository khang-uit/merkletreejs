[merkletreejs](../README.md) › [Globals](../globals.md) › ["src/PatriciaMerkleTree"](../modules/_src_patriciamerkletree_.md) › [PatriciaMerkleTree](_src_patriciamerkletree_.patriciamerkletree.md)

# Class: PatriciaMerkleTree

## Hierarchy

* [Base](_src_patriciamerkletree_.base.md)

  ↳ **PatriciaMerkleTree**

## Index

### Constructors

* [constructor](_src_patriciamerkletree_.patriciamerkletree.md#constructor)

### Methods

* [get](_src_patriciamerkletree_.patriciamerkletree.md#get)
* [getProof](_src_patriciamerkletree_.patriciamerkletree.md#getproof)
* [getRootHash](_src_patriciamerkletree_.patriciamerkletree.md#getroothash)
* [insert](_src_patriciamerkletree_.patriciamerkletree.md#insert)
* [verifyProof](_src_patriciamerkletree_.patriciamerkletree.md#verifyproof)

## Constructors

###  constructor

\+ **new PatriciaMerkleTree**(`options`: [Options](../interfaces/_src_patriciamerkletree_.options.md)): *[PatriciaMerkleTree](_src_patriciamerkletree_.patriciamerkletree.md)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`options` | [Options](../interfaces/_src_patriciamerkletree_.options.md) | {} |

**Returns:** *[PatriciaMerkleTree](_src_patriciamerkletree_.patriciamerkletree.md)*

## Methods

###  get

▸ **get**(`key`: string): *[TValue](../modules/_src_patriciamerkletree_.md#tvalue) | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *[TValue](../modules/_src_patriciamerkletree_.md#tvalue) | null*

___

###  getProof

▸ **getProof**(`key`: string): *any[] | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any[] | null*

___

###  getRootHash

▸ **getRootHash**(): *Buffer*

**Returns:** *Buffer*

___

###  insert

▸ **insert**(`key`: string, `value`: [TValue](../modules/_src_patriciamerkletree_.md#tvalue)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | [TValue](../modules/_src_patriciamerkletree_.md#tvalue) |

**Returns:** *void*

___

###  verifyProof

▸ **verifyProof**(`key`: string, `proof`: any[], `rootHash`: Buffer): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`proof` | any[] |
`rootHash` | Buffer |

**Returns:** *boolean*
