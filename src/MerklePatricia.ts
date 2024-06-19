import keccak256 from 'keccak256'

type TrieNode = LeafNode | BranchNode | ExtensionNode | null;

interface LeafNode {
    type: 'leaf';
    key: number[];
    value: string;
}

interface BranchNode {
    type: 'branch';
    branches: TrieNode[];
    value: string | null;
}

interface ExtensionNode {
    type: 'extension';
    key: number[];
    nextNode: TrieNode;
}

export class MerklePatricia {
    private root: TrieNode;

    constructor () {
      this.root = null
    }

    // Method to add a key-value pair to the trie
    put (key: string, value: string): void {
      const encodedKey = this.encodeKey(key)
      this.root = this.insertNode(this.root, encodedKey, value)
    }

    // Method to get a value by key from the trie
    get (key: string): string | null {
      const encodedKey = this.encodeKey(key)
      return this.getNode(this.root, encodedKey)
    }

    // Helper method to encode the key
    private encodeKey (key: string): number[] {
      return Array.from(key).map(c => parseInt(c, 16))
    }

    // Method to insert a node into the trie
    private insertNode (node: TrieNode, key: number[], value: string): TrieNode {
      if (!node) {
        return { type: 'leaf', key, value }
      }

      if (node.type === 'leaf') {
        return this.handleLeafNode(node, key, value)
      }

      return this.handleBranchOrExtensionNode(node, key, value)
    }

    // Method to handle insertion into a leaf node
    private handleLeafNode (node: LeafNode, key: number[], value: string): TrieNode {
      const matchingLength = this.matchingPrefixLength(node.key, key)
      if (matchingLength === node.key.length) {
        node.value = value
        return node
      }

      const newBranchNode: BranchNode = { type: 'branch', branches: Array(16).fill(null), value: null }
      newBranchNode.branches[node.key[matchingLength]] = this.insertNode(null, node.key.slice(matchingLength + 1), node.value)
      newBranchNode.branches[key[matchingLength]] = this.insertNode(null, key.slice(matchingLength + 1), value)
      return { type: 'extension', key: key.slice(0, matchingLength), nextNode: newBranchNode }
    }

    // Method to handle insertion into a branch or extension node
    private handleBranchOrExtensionNode (node: BranchNode | ExtensionNode, key: number[], value: string): TrieNode {
      if (node.type === 'branch') {
        if (key.length === 0) {
          node.value = value
        } else {
          const branchIndex = key[0]
          node.branches[branchIndex] = this.insertNode(node.branches[branchIndex], key.slice(1), value)
        }
        return node
      }

      if (node.type === 'extension') {
        const matchingLength = this.matchingPrefixLength(node.key, key)
        if (matchingLength < node.key.length) {
          return this.splitExtensionNode(node, key, value, matchingLength)
        }
        node.nextNode = this.insertNode(node.nextNode, key.slice(matchingLength), value)
        return node
      }
    }

    // Helper method to split an extension node
    private splitExtensionNode (node: ExtensionNode, key: number[], value: string, matchingLength: number): TrieNode {
      const newBranchNode: BranchNode = { type: 'branch', branches: Array(16).fill(null), value: null }
      newBranchNode.branches[node.key[matchingLength]] = this.insertNode(null, node.key.slice(matchingLength + 1), this.getNode(node.nextNode, []))
      newBranchNode.branches[key[matchingLength]] = this.insertNode(null, key.slice(matchingLength + 1), value)
      return { type: 'extension', key: key.slice(0, matchingLength), nextNode: newBranchNode }
    }

    // Method to get a node by key from the trie
    private getNode (node: TrieNode, key: number[]): string | null {
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
    private matchingPrefixLength (key1: number[], key2: number[]): number {
      let i = 0
      while (i < key1.length && i < key2.length && key1[i] === key2[i]) {
        i++
      }
      return i
    }

    // Helper method to compare arrays
    private arrayEqual (arr1: number[], arr2: number[]): boolean {
      if (arr1.length !== arr2.length) return false
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
      }
      return true
    }

    // Method to generate a proof for a given key
    generateProof (key: string): any[] {
      const encodedKey = this.encodeKey(key)
      const proof: any[] = []
      this.generateProofRecursive(this.root, encodedKey, proof)
      return proof
    }

    private generateProofRecursive (node: TrieNode, key: number[], proof: any[]): void {
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
    verifyProof(rootHash: string, key: string, proof: any[]): boolean {
      const encodedKey = this.encodeKey(key);
      let expectedNode = proof[0];
  
      for (let i = 1; i < proof.length; i++) {
          const node = proof[i];
  
          if (!node) return false;
  
          if (expectedNode.type === 'branch') {
              if (encodedKey.length === 0) {
                  if (expectedNode.value !== node.value) return false;
              } else {
                  const branchIndex = encodedKey.shift();
                  if (keccak256(JSON.stringify(expectedNode.branches[branchIndex])).toString('hex') !== keccak256(JSON.stringify(node)).toString('hex')) return false;
                  expectedNode = node;
              }
          } else if (expectedNode.type === 'extension') {
              const matchingLength = this.matchingPrefixLength(expectedNode.key, encodedKey);
              if (matchingLength !== expectedNode.key.length) return false;
              expectedNode = node;
              encodedKey.splice(0, matchingLength);
          } else if (expectedNode.type === 'leaf') {
              if (!this.arrayEqual(expectedNode.key, encodedKey)) return false;
              expectedNode = node;
          }
      }
  
      return keccak256(JSON.stringify(proof[0])).toString('hex') === rootHash;
  }
  

    // Method to get the root hash of the trie
    get rootHash (): string {
      return keccak256(JSON.stringify(this.root)).toString('hex')
    }
}
