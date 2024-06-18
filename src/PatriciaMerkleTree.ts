import { Buffer } from 'buffer'
import SHA256 from 'crypto-js/sha256'

type TValue = Buffer | BigInt | string | number | null | undefined;
type THashFnResult = Buffer | string;
type THashFn = (value: TValue) => Buffer;

interface PatriciaMerkleNode {
  key: string;
  value: TValue;
  children: { [key: string]: PatriciaMerkleNode };
}

export interface Options {
  hashFunction?: THashFn;
}

class Base {
  // Base class implementation (if needed)
}

export class PatriciaMerkleTree extends Base {
  private root: PatriciaMerkleNode;
  private hashFunction: THashFn;

  constructor (options: Options = {}) {
    super()
    this.root = { key: '', value: null, children: {} }
    this.hashFunction = options.hashFunction || this.defaultHashFunction.bind(this)
  }

  private defaultHashFunction (value: TValue): Buffer {
    return Buffer.from(SHA256(value?.toString() || '').toString(), 'hex')
  }

  insert (key: string, value: TValue): void {
    let currentNode = this.root
    const keyHash = this.hashFunction(key)
    const hexString = keyHash.toString('hex')

    for (const char of hexString) {
      if (!currentNode.children[char]) {
        currentNode.children[char] = { key: char, value: null, children: {} }
      }
      currentNode = currentNode.children[char]
    }

    currentNode.key = key
    currentNode.value = value
  }

  get (key: string): TValue | null {
    let currentNode = this.root
    const keyHash = this.hashFunction(key)
    const hexString = keyHash.toString('hex')

    for (const char of hexString) {
      if (!currentNode.children[char]) {
        return null
      }
      currentNode = currentNode.children[char]
    }

    if (currentNode.key === key) {
      return currentNode.value
    } else {
      return null
    }
  }

  private computeHash (node: PatriciaMerkleNode): Buffer {
    if (!node) return Buffer.alloc(0)

    const childrenHashes = Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => {
      const childHash = this.computeHash(child)
      return Buffer.concat([Buffer.from(key), childHash])
    })

    const combinedHash = Buffer.concat([Buffer.from(node.key), Buffer.from(node.value?.toString() || ''), ...childrenHashes])
    return this.hashFunction(combinedHash)
  }

  getRootHash (): Buffer {
    return this.computeHash(this.root)
  }

  getProof (key: string): any[] | null {
    const proof: any[] = []
    let currentNode = this.root
    const keyHash = this.hashFunction(key)
    const hexString = keyHash.toString('hex')

    for (const char of hexString) {
      if (!currentNode.children[char]) {
        return null // Key doesn't exist in the tree
      }
      proof.push({
        key: char,
        value: currentNode.value,
        nodeHash: this.computeHash(currentNode).toString('hex')
      })
      currentNode = currentNode.children[char]
    }

    proof.push({
      key: currentNode.key,
      value: currentNode.value,
      nodeHash: this.computeHash(currentNode).toString('hex')
    })

    return proof
  }

  verifyProof (key: string, proof: any[], rootHash: Buffer): boolean {
    let currentNode = this.root
    let currentHash = this.hashFunction(Buffer.concat([Buffer.from(key), Buffer.from(currentNode.value?.toString() || '')]))

    console.log(`Initial hash for key ${key}: ${currentHash.toString('hex')}`)

    for (const node of proof) {
      console.log(`Current proof node: key=${node.key}, value=${node.value}, nodeHash=${node.nodeHash}`)
      const nodeValueBuffer = Buffer.from(node.value?.toString() || '')
      const childrenHashes = Object.entries(currentNode.children).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => {
        const childHash = this.computeHash(child)
        return Buffer.concat([Buffer.from(key), childHash])
      })

      const combinedHash = Buffer.concat([Buffer.from(node.key), nodeValueBuffer, ...childrenHashes])
      currentHash = this.hashFunction(combinedHash)
      console.log(`Updated currentHash: ${currentHash.toString('hex')}`)

      if (currentNode.children[node.key]) {
        currentNode = currentNode.children[node.key]
      }
    }

    console.log(`Final computed hash: ${currentHash.toString('hex')}`)
    console.log(`Expected root hash: ${rootHash.toString('hex')}`)
    return currentHash.equals(rootHash)
  }
}
