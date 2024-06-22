import keccak256 from 'keccak256';

type TrieNode = LeafNode | BranchNode | ExtensionNode | null;

interface LeafNode {
    type: 'leaf';
    key: number[];
    value: string;
    hash: string;
}

interface BranchNode {
    type: 'branch';
    branches: TrieNode[];
    value: string | null;
    hash: string;
}

interface ExtensionNode {
    type: 'extension';
    key: number[];
    nextNode: TrieNode;
    hash: string;
}

export class MerklePatricia {
    private root: TrieNode;

    constructor() {
        this.root = null;
    }

    // Method to add a key-value pair to the trie
    put(key: string, value: string): void {
        const encodedKey = this.encodeKey(key);
        this.root = this.insertNode(this.root, encodedKey, value);
        if (this.root) {
            this.root.hash = this.computeNodeHash(this.root);
        }
    }

    // Method to get a value by key from the trie
    get(key: string): string | null {
        const encodedKey = this.encodeKey(key);
        return this.getNode(this.root, encodedKey);
    }

    // Helper method to encode the key
    private encodeKey (key: string): number[] {
      return Array.from(key).map(c => parseInt(c, 16))
    }

    // Method to insert a node into the trie
    private insertNode(node: TrieNode, key: number[], value: string): TrieNode {
        if (!node) {
            return this.createLeafNode(key, value);
        }

        if (node.type === 'leaf') {
            return this.handleLeafNode(node, key, value);
        }

        return this.handleBranchOrExtensionNode(node, key, value);
    }

    // Method to handle insertion into a leaf node
    private handleLeafNode(node: LeafNode, key: number[], value: string): TrieNode {
        const matchingLength = this.matchingPrefixLength(node.key, key);
        if (matchingLength === node.key.length) {
            node.value = value;
            node.hash = this.computeNodeHash(node);
            return node;
        }

        const newBranchNode: BranchNode = {
            type: 'branch',
            branches: Array(16).fill(null),
            value: null,
            hash: ''
        };
        newBranchNode.branches[node.key[matchingLength]] = this.insertNode(null, node.key.slice(matchingLength + 1), node.value);
        newBranchNode.branches[key[matchingLength]] = this.insertNode(null, key.slice(matchingLength + 1), value);
        newBranchNode.hash = this.computeNodeHash(newBranchNode);
        const newExtensionNode: ExtensionNode = {
          type: 'extension',
          key: key.slice(0, matchingLength),
          nextNode: newBranchNode,
          hash: ''
      };
      newExtensionNode.hash = this.computeNodeHash(newExtensionNode)
      return newExtensionNode
    }

    // Method to handle insertion into a branch or extension node
    private handleBranchOrExtensionNode(node: BranchNode | ExtensionNode, key: number[], value: string): TrieNode {
        if (node.type === 'branch') {
            if (key.length === 0) {
                node.value = value;
            } else {
                const branchIndex = key[0];
                node.branches[branchIndex] = this.insertNode(node.branches[branchIndex], key.slice(1), value);
            }
            node.hash = this.computeNodeHash(node);
            return node;
        }

        if (node.type === 'extension') {
            const matchingLength = this.matchingPrefixLength(node.key, key);
            if (matchingLength < node.key.length) {
                return this.splitExtensionNode(node, key, value, matchingLength);
            }
            node.nextNode = this.insertNode(node.nextNode, key.slice(matchingLength), value);
            node.hash = this.computeNodeHash(node);
            return node;
        }
    }

    // Method to create a leaf node
    private createLeafNode(key: number[], value: string): LeafNode {
        const node: LeafNode = { type: 'leaf', key, value, hash: '' };
        node.hash = this.computeNodeHash(node);
        return node;
    }

    // Method to split an extension node
    private splitExtensionNode(node: ExtensionNode, key: number[], value: string, matchingLength: number): TrieNode {
        const newBranchNode: BranchNode = {
            type: 'branch',
            branches: Array(16).fill(null),
            value: null,
            hash: ''
        };
        newBranchNode.branches[node.key[matchingLength]] = this.insertNode(null, node.key.slice(matchingLength + 1), this.getNode(node.nextNode, []));
        newBranchNode.branches[key[matchingLength]] = this.insertNode(null, key.slice(matchingLength + 1), value);
        newBranchNode.hash = this.computeNodeHash(newBranchNode);
        const newExtensionNode: ExtensionNode = {
            type: 'extension',
            key: key.slice(0, matchingLength),
            nextNode: newBranchNode,
            hash: ''
        };
        newExtensionNode.hash = this.computeNodeHash(newExtensionNode)
        return newExtensionNode
    }

    // Method to get a node by key from the trie
    private getNode(node: TrieNode, key: number[]): string | null {
        if (!node) return null;

        if (node.type === 'leaf') {
            if (this.arrayEqual(node.key, key)) {
                return node.value;
            }
            return null;
        }

        if (node.type === 'branch') {
            if (key.length === 0) {
                return node.value;
            }
            return this.getNode(node.branches[key[0]], key.slice(1));
        }

        if (node.type === 'extension') {
            const matchingLength = this.matchingPrefixLength(node.key, key);
            if (matchingLength === node.key.length) {
                return this.getNode(node.nextNode, key.slice(matchingLength));
            }
            return null;
        }
    }

    // Helper method to find matching prefix length
    private matchingPrefixLength(key1: number[], key2: number[]): number {
        let i = 0;
        while (i < key1.length && i < key2.length && key1[i] === key2[i]) {
            i++;
        }
        return i;
    }

    // Helper method to compare arrays
    private arrayEqual(arr1: number[], arr2: number[]): boolean {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    // Method to generate a proof for a given key
    generateProof(key: string): any[] {
        const encodedKey = this.encodeKey(key);
        const proof: any[] = [];
        this.generateProofRecursive(this.root, encodedKey, proof);
        return proof;
    }

    private generateProofRecursive(node: TrieNode, key: number[], proof: any[]): void {
        if (!node) return;

        proof.push(node);

        if (node.type === 'leaf') {
            return;
        }

        if (node.type === 'extension') {
            const matchingLength = this.matchingPrefixLength(node.key, key);
            if (matchingLength === node.key.length) {
                this.generateProofRecursive(node.nextNode, key.slice(matchingLength), proof);
            }
        } else if (node.type === 'branch') {
            if (key.length > 0) {
                this.generateProofRecursive(node.branches[key[0]], key.slice(1), proof);
            }
        }
    }

    // Method to verify a proof for a given key
    verifyProof(rootHash: string, key: string, proof: any[]): boolean {
        const encodedKey = this.encodeKey(key);
        let currentHash = rootHash;
        let currentKey = encodedKey;

        for (let i = 0; i < proof.length; i++) {
            const node = proof[i];
            const nodeHash = this.computeNodeHash(node);
            if (nodeHash !== currentHash) {
                return false;
            }

            if (node.type === 'branch') {
                if (currentKey.length === 0) {
                    return node.value !== null;
                }
                currentHash = node.branches[currentKey[0]] ? node.branches[currentKey[0]].hash : '';
                currentKey = currentKey.slice(1);
            } else if (node.type === 'extension') {
                const matchingLength = this.matchingPrefixLength(node.key, currentKey);
                if (matchingLength !== node.key.length) {
                    return false;
                }
                currentHash = node.nextNode ? node.nextNode.hash : '';
                currentKey = currentKey.slice(matchingLength);
            } else if (node.type === 'leaf') {
                if (!this.arrayEqual(node.key, currentKey)) {
                    return false;
                }
                return node.value !== null;
            }
        }

        return false;
    }

    // Method to compute hash for a node
    private computeNodeHash(node: TrieNode): string {
        if (!node) return '';

        if (node.type === 'leaf') {
            return keccak256(node.key.toString() + node.value).toString('hex');
        } else if (node.type === 'branch') {
            const childHashes = node.branches.map(branch => branch ? branch.hash : '').join('');
            return keccak256(childHashes + (node.value || '')).toString('hex');
        } else if (node.type === 'extension') {
            return keccak256(node.key.toString() + (node.nextNode ? node.nextNode.hash : '')).toString('hex');
        }
        return '';
    }

    // Method to get the root hash of the trie
    get rootHash(): string {
        return this.root ? this.root.hash : '';
    }
}