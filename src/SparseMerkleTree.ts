import { createHash } from 'crypto';

export class SparseMerkleTree {
  private height: number;
  private defaultNodes: string[];
  private root: string;
  private nodes: Map<string, string>;

  constructor(height: number) {
    this.height = height;
    this.defaultNodes = this.generateDefaultNodes();
    this.root = this.defaultNodes[this.height];
    this.nodes = new Map();
  }

  // Generate default nodes for an empty tree
  private generateDefaultNodes(): string[] {
    const defaultNodes = [this.hash('')];
    for (let i = 1; i <= this.height; i++) {
      const hash = this.hash(defaultNodes[i - 1] + defaultNodes[i - 1]);
      defaultNodes.push(hash);
    }
    return defaultNodes;
  }

  // Hashing function
  private hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  // Get the root of the tree
  getRoot(): string {
    return this.root;
  }

  // Insert a leaf into the tree
  insert(path: string, value: string) {
    const leafHash = this.hash(value);
    this.nodes.set(path, leafHash);
    this.root = this.updatePath(path, leafHash);
  }

  // Update the path from a leaf to the root
  private updatePath(path: string, value: string): string {
    let currentHash = value;
    let currentPath = path;
    this.nodes.set(currentPath, currentHash);
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingHash = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      if (this.isLeftNode(currentPath)) {
        currentHash = this.hash(currentHash + siblingHash);
      } else {
        currentHash = this.hash(siblingHash + currentHash);
      }
      currentPath = this.getParentPath(currentPath);
      this.nodes.set(currentPath, currentHash);
    }
    return currentHash;
  }

  // Generate a proof for a given key
  generateProof(path: string): string[] {
    const proof = [];
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingHash = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      proof.push(siblingHash);
      currentPath = this.getParentPath(currentPath);
    }
    return proof;
  }

  // Verify a proof
  verifyProof(path: string, value: string, proof: string[], root: string): boolean {
    let currentHash = this.hash(value);
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingHash = proof[this.height - i - 1];
      if (this.isLeftNode(currentPath)) {
        currentHash = this.hash(currentHash + siblingHash);
      } else {
        currentHash = this.hash(siblingHash + currentHash);
      }
      currentPath = this.getParentPath(currentPath);
    }
    return currentHash === root;
  }

  // Helper function to get the sibling path
  private getSiblingPath(path: string): string {
    const bit = path[path.length - 1];
    return bit === '0' ? path.slice(0, -1) + '1' : path.slice(0, -1) + '0';
  }

  // Helper function to get the parent path
  private getParentPath(path: string): string {
    return path.slice(0, -1);
  }

  // Helper function to determine if a node is a left node
  private isLeftNode(path: string): boolean {
    return path[path.length - 1] === '0';
  }

  // Visualize the tree
  printTree() {
    console.log('Sparse Merkle Tree:');
    for (let i = 0; i <= this.height; i++) {
      const levelNodes: string[] = [];
      const levelSize = Math.pow(2, i);
      for (let j = 0; j < levelSize; j++) {
        const path = j.toString(2).padStart(i, '0');
        const hash = this.nodes.get(path) || this.defaultNodes[this.height - i];
        levelNodes.push(hash);
      }
      console.log(`Level ${i}:`, levelNodes);
    }
    console.log('Root:', this.root);
  }
}

