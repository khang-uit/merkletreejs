import { createHash } from 'crypto';

// Type definition for the hash function
type THashFn = (value: string) => string;

export class MerkleSparseSumTree {
  private height: number;
  private defaultNodes: { hash: string, sum: BigInt }[];
  private root: { hash: string, sum: BigInt };
  private nodes: Map<string, { hash: string, sum: BigInt }>;
  private hashFn: THashFn;

  constructor(height: number, hashFn: THashFn) {
    if (height <= 0) throw new Error("Tree height must be greater than 0.");
    this.height = height;
    this.hashFn = hashFn;
    this.defaultNodes = this.generateDefaultNodes();
    this.root = this.defaultNodes[this.height];
    this.nodes = new Map();
  }

  // Generate default nodes for an empty tree
  private generateDefaultNodes(): { hash: string, sum: BigInt }[] {
    const defaultNodes = [{ hash: this.hashFn(''), sum: BigInt(0) }];
    for (let i = 1; i <= this.height; i++) {
      const hash = this.hashFn(defaultNodes[i - 1].hash + defaultNodes[i - 1].hash);
      const sum = BigInt(0);
      defaultNodes.push({ hash, sum });
    }
    return defaultNodes;
  }

  // Hashing function
  private hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  // Get the root of the tree
  getRoot(): { hash: string, sum: BigInt } {
    return this.root;
  }

  
  // Get the node at a given path
  getNode(path: string): { hash: string, sum: BigInt } {
    return this.nodes.get(path) || this.defaultNodes[this.height - path.length];
  }

  // Insert a leaf into the tree
  insert(path: string, value: string, sum: BigInt) {
    if (path.length !== this.height) throw new Error("Path length does not match tree height.");
    const leafHash = this.hashFn(value);
    this.nodes.set(path, { hash: leafHash, sum });
    this.root = this.updatePath(path, { hash: leafHash, sum });
  }

  // Update the path from a leaf to the root
  private updatePath(path: string, value: { hash: string, sum: BigInt }): { hash: string, sum: BigInt } {
    let currentNode = value;
    let currentPath = path;
    this.nodes.set(currentPath, currentNode);
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingNode = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      const combinedHash = this.isLeftNode(currentPath)
        ? this.hashFn(currentNode.hash + siblingNode.hash)
        : this.hashFn(siblingNode.hash + currentNode.hash);
      const combinedSum = BigInt(currentNode.sum) + BigInt(siblingNode.sum);
      currentNode = { hash: combinedHash, sum: combinedSum };
      currentPath = this.getParentPath(currentPath);
      this.nodes.set(currentPath, currentNode);
    }
    return currentNode;
  }

  // Generate a proof for a given key
  generateProof(path: string): { hash: string, sum: BigInt }[] {
    if (path.length !== this.height) throw new Error("Path length does not match tree height.");
    const proof = [];
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingNode = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      proof.push(siblingNode);
      currentPath = this.getParentPath(currentPath);
    }
    return proof;
  }

  // Verify a proof
  verifyProof(path: string, value: string, sum: BigInt, proof: { hash: string, sum: BigInt }[], root: { hash: string, sum: BigInt }): boolean {
    if (path.length !== this.height) throw new Error("Path length does not match tree height.");
    let currentNode = { hash: this.hashFn(value), sum };
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingNode = proof[this.height - i - 1];
      const combinedHash = this.isLeftNode(currentPath)
        ? this.hashFn(currentNode.hash + siblingNode.hash)
        : this.hashFn(siblingNode.hash + currentNode.hash);
      const combinedSum = BigInt(currentNode.sum) + BigInt(siblingNode.sum);
      currentNode = { hash: combinedHash, sum: combinedSum };
      currentPath = this.getParentPath(currentPath);
    }
    return currentNode.hash === root.hash && currentNode.sum === root.sum;
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

  // Get all the leaf nodes
  getLeaves(): { hash: string, sum: BigInt }[] {
    const leaves: { hash: string, sum: BigInt }[] = [];
    const leafCount = Math.pow(2, this.height);
    for (let i = 0; i < leafCount; i++) {
      const path = i.toString(2).padStart(this.height, '0');
      const leaf = this.nodes.get(path) || this.defaultNodes[0];
      leaves.push(leaf);
    }
    return leaves;
  }

  // Get all layers of the tree
  getLayers(): { hash: string, sum: BigInt }[][] {
    const layers: { hash: string, sum: BigInt }[][] = [];
    for (let i = 0; i <= this.height; i++) {
      const levelNodes: { hash: string, sum: BigInt }[] = [];
      const levelSize = Math.pow(2, i);
      for (let j = 0; j < levelSize; j++) {
        const path = j.toString(2).padStart(i, '0');
        const node = this.nodes.get(path) || this.defaultNodes[this.height - i];
        levelNodes.push(node);
      }
      layers.push(levelNodes);
    }
    return layers;
  }

  // Get the flattened list of nodes for all layers
  getFlatLayers(): string[] {
    const flatLayers: string[] = ["0x00"];
    this.getLayers().forEach(layer => {
      layer.forEach(node => {
        flatLayers.push(`0x${node.hash}`);
      });
    });
    return flatLayers;
  }

  getTreeVisualization(): string {
    const visualize = (node: { hash: string, sum: BigInt }, path: string, depth: number, prefix: string): string => {
      const indent = '   '.repeat(depth);
  
      if (path.length === this.height) {
        return `${indent}${prefix}${node.hash} ${path} ${node.sum}\n`;
      }
  
      const leftChildPath = path + '0';
      const rightChildPath = path + '1';
      const leftChild = this.nodes.get(leftChildPath) || this.defaultNodes[this.height - path.length - 1];
      const rightChild = this.nodes.get(rightChildPath) || this.defaultNodes[this.height - path.length - 1];
  
      if (leftChild.hash !== rightChild.hash) {
        return `${indent}${prefix}${node.hash} ${path} ${node.sum}\n` +
               `${visualize(leftChild, leftChildPath, depth + 1, '├─ ')}` +
               `${visualize(rightChild, rightChildPath, depth + 1, '└─ ')}`;
      }
      
      return `${indent}${prefix}${node.hash} ${path} ${node.sum}\n` +
             `${visualize(leftChild, leftChildPath, depth + 1, '└─ ')}`;
    };
  
    const rootPath = ''; // Assuming the root path is empty or initialize accordingly
    return visualize(this.root, rootPath, 0, '└─ ');
  }


  // Visualize the tree
  printTree() {
    console.log('Sparse Sum Merkle Tree:');
    for (let i = 0; i <= this.height; i++) {
      const levelNodes: { hash: string, sum: BigInt }[] = [];
      const levelSize = Math.pow(2, i);
      for (let j = 0; j < levelSize; j++) {
        const path = j.toString(2).padStart(i, '0');
        const node = this.nodes.get(path) || this.defaultNodes[this.height - i];
        levelNodes.push(node);
      }
      console.log(`Level ${i}:`, levelNodes);
    }
    console.log('Root:', this.root);
  }
}

// Example of a hash function
const hashFn = (data: string): string => {
  return createHash('sha256').update(data).digest('hex');
};

if (typeof window !== 'undefined') {
  ; (window as any).MerkleSparseSumTree = MerkleSparseSumTree
}