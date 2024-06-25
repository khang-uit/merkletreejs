import keccak256 from 'keccak256'

type TrieNode = LeafNode | BranchNode | ExtensionNode | null;

interface LeafNode {
    type: 'leaf';
    key: Buffer;
    value: Buffer;
    hash: Buffer;
}

interface BranchNode {
    type: 'branch';
    branches: TrieNode[];
    value: Buffer | null;
    hash: Buffer;
}

interface ExtensionNode {
    type: 'extension';
    key: Buffer;
    nextNode: TrieNode;
    hash: Buffer;
}

export class MerklePatricia {
    private root: TrieNode;

    constructor () {
      this.root = null
    }

    // Method to add a key-value pair to the trie
    put (key: string, value: string): void {
      const encodedKey = this.encodeKey(key)
      this.root = this.insertNode(this.root, encodedKey, Buffer.from(value))
      if (this.root) {
        this.root.hash = this.computeNodeHash(this.root)
      }
    }

    // Method to get a value by key from the trie
    get (key: string): string | null {
      const encodedKey = this.encodeKey(key)
      const value = this.getNode(this.root, encodedKey)
      return value ? value.toString() : null
    }

    // Helper method to encode the key
    private encodeKey (key: string): Buffer {
      return Buffer.from(Array.from(key).map(c => parseInt(c, 16)))
    }

    // Method to insert a node into the trie
    private insertNode (node: TrieNode, key: Buffer, value: Buffer): TrieNode {
      if (!node) {
        return this.createLeafNode(key, value)
      }

      if (node.type === 'leaf') {
        return this.handleLeafNode(node, key, value)
      }

      return this.handleBranchOrExtensionNode(node, key, value)
    }

    // Method to handle insertion into a leaf node
    private handleLeafNode (node: LeafNode, key: Buffer, value: Buffer): TrieNode {
      const matchingLength = this.matchingPrefixLength(node.key, key)
      if (matchingLength === node.key.length) {
        node.value = value
        node.hash = this.computeNodeHash(node)
        return node
      }

      const newBranchNode: BranchNode = {
        type: 'branch',
        branches: Array(16).fill(null),
        value: null,
        hash: Buffer.alloc(0)
      }
      newBranchNode.branches[node.key[matchingLength]] = this.insertNode(null, node.key.slice(matchingLength + 1), node.value)
      newBranchNode.branches[key[matchingLength]] = this.insertNode(null, key.slice(matchingLength + 1), value)
      newBranchNode.hash = this.computeNodeHash(newBranchNode)
      const newExtensionNode: ExtensionNode = {
        type: 'extension',
        key: key.slice(0, matchingLength),
        nextNode: newBranchNode,
        hash: Buffer.alloc(0)
      }
      newExtensionNode.hash = this.computeNodeHash(newExtensionNode)
      return newExtensionNode
    }

    // Method to handle insertion into a branch or extension node
    private handleBranchOrExtensionNode (node: BranchNode | ExtensionNode, key: Buffer, value: Buffer): TrieNode {
      if (node.type === 'branch') {
        if (key.length === 0) {
          node.value = value
        } else {
          const branchIndex = key[0]
          node.branches[branchIndex] = this.insertNode(node.branches[branchIndex], key.slice(1), value)
        }
        node.hash = this.computeNodeHash(node)
        return node
      }

      if (node.type === 'extension') {
        const matchingLength = this.matchingPrefixLength(node.key, key)
        if (matchingLength < node.key.length) {
          return this.splitExtensionNode(node, key, value, matchingLength)
        }
        node.nextNode = this.insertNode(node.nextNode, key.slice(matchingLength), value)
        node.hash = this.computeNodeHash(node)
        return node
      }
    }

    // Method to create a leaf node
    private createLeafNode (key: Buffer, value: Buffer): LeafNode {
      const node: LeafNode = { type: 'leaf', key, value, hash: Buffer.alloc(0) }
      node.hash = this.computeNodeHash(node)
      return node
    }

    // Method to split an extension node
    private splitExtensionNode (node: ExtensionNode, key: Buffer, value: Buffer, matchingLength: number): TrieNode {
      const newBranchNode: BranchNode = {
        type: 'branch',
        branches: Array(16).fill(null),
        value: null,
        hash: Buffer.alloc(0)
      }
      newBranchNode.branches[node.key[matchingLength]] = this.insertNode(null, node.key.slice(matchingLength + 1), this.getNode(node.nextNode, Buffer.alloc(0)) || Buffer.alloc(0))
      newBranchNode.branches[key[matchingLength]] = this.insertNode(null, key.slice(matchingLength + 1), value)
      newBranchNode.hash = this.computeNodeHash(newBranchNode)
      const newExtensionNode: ExtensionNode = {
        type: 'extension',
        key: key.slice(0, matchingLength),
        nextNode: newBranchNode,
        hash: Buffer.alloc(0)
      }
      newExtensionNode.hash = this.computeNodeHash(newExtensionNode)
      return newExtensionNode
    }

    // Method to get a node by key from the trie
    private getNode (node: TrieNode, key: Buffer): Buffer | null {
      if (!node) return null

      if (node.type === 'leaf') {
        if (this.arrayEqual(node.key, key)) {
          return node.value
        }
        return null
      }

      if (node.type === 'branch') {
        if (key.length === 0) {
          return node.value
        }
        return this.getNode(node.branches[key[0]], key.slice(1))
      }

      if (node.type === 'extension') {
        const matchingLength = this.matchingPrefixLength(node.key, key)
        if (matchingLength === node.key.length) {
          return this.getNode(node.nextNode, key.slice(matchingLength))
        }
        return null
      }
    }

    // Helper method to find matching prefix length
    private matchingPrefixLength (key1: Buffer, key2: Buffer): number {
      let i = 0
      while (i < key1.length && i < key2.length && key1[i] === key2[i]) {
        i++
      }
      return i
    }

    // Helper method to compare buffers
    private arrayEqual (arr1: Buffer, arr2: Buffer): boolean {
      return arr1.equals(arr2)
    }

    // Method to generate a proof for a given key
    generateProof (key: string): any[] {
      const encodedKey = this.encodeKey(key)
      const proof: any[] = []
      this.generateProofRecursive(this.root, encodedKey, proof)
      return proof.map(node => ({ ...node, hash: node.hash.toString('hex') }))
    }

    private generateProofRecursive (node: TrieNode, key: Buffer, proof: any[]): void {
      if (!node) return

      proof.push(node)

      if (node.type === 'leaf') {
        return
      }

      if (node.type === 'extension') {
        const matchingLength = this.matchingPrefixLength(node.key, key)
        if (matchingLength === node.key.length) {
          this.generateProofRecursive(node.nextNode, key.slice(matchingLength), proof)
        }
      } else if (node.type === 'branch') {
        if (key.length > 0) {
          this.generateProofRecursive(node.branches[key[0]], key.slice(1), proof)
        }
      }
    }

    // Method to verify a proof for a given key
    verifyProof (rootHash: string, key: string, proof: any[]): boolean {
      const encodedKey = this.encodeKey(key)
      let currentHash = Buffer.from(rootHash, 'hex')
      let currentKey = encodedKey

      for (let i = 0; i < proof.length; i++) {
        const node = proof[i]
        const nodeHash = this.computeNodeHash({
          ...node,
          hash: Buffer.from(node.hash, 'hex')
        })
        if (!nodeHash.equals(currentHash)) {
          return false
        }

        if (node.type === 'branch') {
          if (currentKey.length === 0) {
            return node.value !== null
          }
          currentHash = node.branches[currentKey[0]] ? Buffer.from(node.branches[currentKey[0]].hash, 'hex') : Buffer.alloc(0)
          currentKey = currentKey.slice(1)
        } else if (node.type === 'extension') {
          const matchingLength = this.matchingPrefixLength(node.key, currentKey)
          if (matchingLength !== node.key.length) {
            return false
          }
          currentHash = node.nextNode ? Buffer.from(node.nextNode.hash, 'hex') : Buffer.alloc(0)
          currentKey = currentKey.slice(matchingLength)
        } else if (node.type === 'leaf') {
          if (!this.arrayEqual(node.key, currentKey)) {
            return false
          }
          return node.value !== null
        }
      }

      return false
    }

    // Method to compute hash for a node
    private computeNodeHash (node: TrieNode): Buffer {
      if (!node) return Buffer.alloc(0)

      if (node.type === 'leaf') {
        return keccak256(Buffer.concat([node.key, node.value]))
      } else if (node.type === 'branch') {
        const childHashes = node.branches.map(branch => branch ? branch.hash : Buffer.alloc(0))
        return keccak256(Buffer.concat([...childHashes, node.value || Buffer.alloc(0)]))
      } else if (node.type === 'extension') {
        return keccak256(Buffer.concat([node.key, node.nextNode ? node.nextNode.hash : Buffer.alloc(0)]))
      }
      return Buffer.alloc(0)
    }

    // Method to get the root hash of the trie
    get rootHash (): string {
      return this.root ? this.root.hash.toString('hex') : ''
    }

    // Method to get all leaf node hashes
    getLeaves (): string[] {
      const leaves: string[] = []
      this.collectLeaves(this.root, leaves)
      return leaves
    }

    private collectLeaves (node: TrieNode, leaves: string[]): void {
      if (!node) return

      if (node.type === 'leaf') {
        leaves.push(node.hash.toString('hex'))
      } else if (node.type === 'branch') {
        for (const branch of node.branches) {
          this.collectLeaves(branch, leaves)
        }
      } else if (node.type === 'extension') {
        this.collectLeaves(node.nextNode, leaves)
      }
    }

    // Method to get flat layers of hashes
    getFlatLayers (): string[] {
      const layers: string[] = []
      this.collectFlatLayers(this.root, layers, 0)
      return layers
    }

    private collectFlatLayers (node: TrieNode, layers: string[], depth: number): void {
      if (!node) return

      while (layers.length <= depth) {
        layers.push('')
      }

      layers[depth] += node.hash.toString('hex')

      if (node.type === 'branch') {
        for (const branch of node.branches) {
          this.collectFlatLayers(branch, layers, depth + 1)
        }
      } else if (node.type === 'extension') {
        this.collectFlatLayers(node.nextNode, layers, depth + 1)
      }
    }

    // Method to get a string representation of the tree structure
    getTreeStructure (): string {
      return this.buildTreeStructure(this.root, '')
    }

    private buildTreeStructure (node: TrieNode, indent: string): string {
      if (!node) return ''

      let result = `${indent}└─ ${node.hash.toString('hex')} ${node.type}\n`

      if (node.type === 'branch') {
        const newIndent = indent + '   '
        for (const branch of node.branches) {
          result += this.buildTreeStructure(branch, newIndent)
        }
      } else if (node.type === 'extension') {
        result += this.buildTreeStructure(node.nextNode, indent + '   ')
      }

      return result
    }
}

if (typeof window !== 'undefined') {
  (window as any).MerklePatricia = MerklePatricia
}
