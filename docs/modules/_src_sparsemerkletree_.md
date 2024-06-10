[merkletreejs](../README.md) › [Globals](../globals.md) › ["src/SparseMerkleTree"](_src_sparsemerkletree_.md)

# Module: "src/SparseMerkleTree"

## Index

### Classes

* [SparseMerkleTree](../classes/_src_sparsemerkletree_.sparsemerkletree.md)

### Interfaces

* [Options](../interfaces/_src_sparsemerkletree_.options.md)

### Type aliases

* [TFillDefaultHash](_src_sparsemerkletree_.md#tfilldefaulthash)
* [THashFn](_src_sparsemerkletree_.md#thashfn)
* [THashFnResult](_src_sparsemerkletree_.md#thashfnresult)
* [TLayer](_src_sparsemerkletree_.md#tlayer)
* [TLeaf](_src_sparsemerkletree_.md#tleaf)
* [TValue](_src_sparsemerkletree_.md#tvalue)

## Type aliases

###  TFillDefaultHash

Ƭ **TFillDefaultHash**: *function*

#### Type declaration:

▸ (`idx?`: number, `hashFn?`: [THashFn](_src_sparsemerkletree_.md#thashfn)): *[THashFnResult](_src_sparsemerkletree_.md#thashfnresult)*

**Parameters:**

Name | Type |
------ | ------ |
`idx?` | number |
`hashFn?` | [THashFn](_src_sparsemerkletree_.md#thashfn) |

___

###  THashFn

Ƭ **THashFn**: *function*

#### Type declaration:

▸ (`value`: [TValue](_src_sparsemerkletree_.md#tvalue)): *Buffer*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [TValue](_src_sparsemerkletree_.md#tvalue) |

___

###  THashFnResult

Ƭ **THashFnResult**: *Buffer | string*

___

###  TLayer

Ƭ **TLayer**: *any*

___

###  TLeaf

Ƭ **TLeaf**: *Buffer*

___

###  TValue

Ƭ **TValue**: *Buffer | BigInt | string | number | null | undefined*
