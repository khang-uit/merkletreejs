import { Base } from './Base';
import { createHash } from 'crypto';

// Type definition for the hash function

export class MerkleSparseSumTree extends Base {
  private height: number;
  private defaultNodes: { hash: Buffer, sum: BigInt }[];
  private root: { hash: Buffer, sum: BigInt };
  private nodes: Map<string, { hash: Buffer, sum: BigInt }>;

  constructor(height: number, leaves: { path: string, value: string, sum: BigInt }[] = []) {
    super();
    if (height <= 0) throw new Error("Tree height must be greater than 0.");
    this.height = height;
    this.defaultNodes = this.generateDefaultNodes();
    this.nodes = new Map();
    this.root = this.defaultNodes[this.height];

    // Insert the initial leaves efficiently
    this.insertLeaves(leaves);
    // Update the branches after inserting all leaves
    this.updateBranches();
  }

  // Generate default nodes for an empty tree
  private generateDefaultNodes(): { hash: Buffer, sum: BigInt }[] {
    const defaultNodes = [{ hash: this.hash(this.bufferify('')), sum: BigInt(0) }];
    for (let i = 1; i <= this.height; i++) {
      const hash = this.hash(Buffer.concat([defaultNodes[i - 1].hash, defaultNodes[i - 1].hash]));
      const sum = BigInt(0);
      defaultNodes.push({ hash, sum });
    }
    return defaultNodes;
  }

  // Hashing function
  private hash(data: Buffer): Buffer {
    return createHash('sha256').update(data).digest();
  }

  // Get the root of the tree
  getRoot(): { hash: string, sum: BigInt } {
    return { hash: this.root.hash.toString('hex'), sum: this.root.sum };
  }

  // Get the node at a given path
  getNode(path: string): { hash: string, sum: BigInt } {
    const node = this.nodes.get(path) || this.defaultNodes[this.height - path.length];
    return { hash: node.hash.toString('hex'), sum: node.sum };
  }

  // Insert a leaf into the tree
  insert(path: string, value: string, sum: BigInt) {
    if (path.length !== this.height) throw new Error("Path length does not match tree height.");
    const leafHash = this.hash(this.bufferify(value));
    this.nodes.set(path, { hash: leafHash, sum });
    this.root = this.updatePath(path, { hash: leafHash, sum });
  }

  // Insert multiple leaves into the tree efficiently
  private insertLeaves(leaves: { path: string, value: string, sum: BigInt }[]) {
    for (const leaf of leaves) {
      const leafHash = this.hash(this.bufferify(leaf.value));
      this.nodes.set(leaf.path, { hash: leafHash, sum: leaf.sum });
    }
    this.updateBranches();
  }

  // Update the path from a leaf to the root
  private updatePath(path: string, value: { hash: Buffer, sum: BigInt }): { hash: Buffer, sum: BigInt } {
    let currentNode = value;
    let currentPath = path;
    this.nodes.set(currentPath, currentNode);
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingNode = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      const combinedHash = this.isLeftNode(currentPath)
        ? this.hash(Buffer.concat([currentNode.hash, siblingNode.hash]))
        : this.hash(Buffer.concat([siblingNode.hash, currentNode.hash]));
      const combinedSum = BigInt(currentNode.sum) + BigInt(siblingNode.sum);
      currentNode = { hash: combinedHash, sum: combinedSum };
      currentPath = this.getParentPath(currentPath);
      this.nodes.set(currentPath, currentNode);
    }
    return currentNode;
  }

  // Update all branches of the tree from leaves to root
  private updateBranches() {
    // Bắt đầu từ mức độ sâu nhất (lá) và di chuyển lên đến gốc
    for (let level = this.height - 1; level >= 0; level--) {
      const numNodes = 2 ** level; // Số lượng nút ở mức hiện tại
      for (let index = 0; index < numNodes; index++) {
        let path = '';
        if (level === 0) {
          path = '';
        } else {
          path = index.toString(2).padStart(level, '0');
        }
        const leftChildPath = path + '0';
        const rightChildPath = path + '1';

        // Lấy các giá trị băm của các nút con trái và phải
        const leftChild = this.nodes.get(leftChildPath) || this.defaultNodes[this.height - level - 1];
        const rightChild = this.nodes.get(rightChildPath) || this.defaultNodes[this.height - level - 1];

        // Tính giá trị băm của nút cha từ các nút con
        const parentHash = this.hash(Buffer.concat([leftChild.hash, rightChild.hash]));
        const parentSum = BigInt(leftChild.sum) + BigInt(rightChild.sum);
        this.nodes.set(path, { hash: parentHash, sum: parentSum }); // Cập nhật nút cha
      }
    }

    // Cập nhật gốc của cây
    this.root = this.nodes.get('') || this.defaultNodes[this.height];
  }

  // Generate a proof for a given key
  generateProof(path: string): { hash: string, sum: BigInt }[] {
    if (path.length !== this.height) throw new Error("Path length does not match tree height.");
    const proof = [];
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingNode = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      proof.push({ hash: siblingNode.hash.toString('hex'), sum: siblingNode.sum });
      currentPath = this.getParentPath(currentPath);
    }
    return proof;
  }

  // Verify a proof
  verifyProof(path: string, value: string, sum: BigInt, proof: { hash: string, sum: BigInt }[], root: { hash: string, sum: BigInt }): boolean {
    if (path.length !== this.height) throw new Error("Path length does not match tree height.");
    let currentNode = { hash: this.hash(this.bufferify(value)), sum };
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingNode = proof[this.height - i - 1];
      const siblingHash = Buffer.from(siblingNode.hash, 'hex');
      const combinedHash = this.isLeftNode(currentPath)
        ? this.hash(Buffer.concat([currentNode.hash, siblingHash]))
        : this.hash(Buffer.concat([siblingHash, currentNode.hash]));
      const combinedSum = BigInt(currentNode.sum) + BigInt(siblingNode.sum);
      currentNode = { hash: combinedHash, sum: combinedSum };
      currentPath = this.getParentPath(currentPath);
    }
    return currentNode.hash.equals(Buffer.from(root.hash, 'hex')) && currentNode.sum === root.sum;
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
      leaves.push({ hash: leaf.hash.toString('hex'), sum: leaf.sum });
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
        levelNodes.push({ hash: node.hash.toString('hex'), sum: node.sum });
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
    const visualize = (node: { hash: Buffer, sum: BigInt }, path: string, depth: number, prefix: string): string => {
      const indent = '   '.repeat(depth);
  
      if (path.length === this.height) {
        return `${indent}${prefix}${node.hash.toString('hex')} ${path} ${node.sum}\n`;
      }
  
      const leftChildPath = path + '0';
      const rightChildPath = path + '1';
      const leftChild = this.nodes.get(leftChildPath) || this.defaultNodes[this.height - path.length - 1];
      const rightChild = this.nodes.get(rightChildPath) || this.defaultNodes[this.height - path.length - 1];
  
      if (!leftChild.hash.equals(rightChild.hash)) {
        return `${indent}${prefix}${node.hash.toString('hex')} ${path} ${node.sum}\n` +
               `${visualize(leftChild, leftChildPath, depth + 1, '├─ ')}` +
               `${visualize(rightChild, rightChildPath, depth + 1, '└─ ')}`;
      }
      
      return `${indent}${prefix}${node.hash.toString('hex')} ${path} ${node.sum}\n` +
             `${visualize(leftChild, leftChildPath, depth + 1, '└─ ')}`;
    };
  
    const rootPath = ''; // Assuming the root path is empty or initialize accordingly
    return visualize(this.root, rootPath, 0, '└─ ');
  }

  // Visualize the tree
  printTree() {
    console.log('Sparse Sum Merkle Tree:');
    for (let i = 0; i <= this.height; i++) {
      const levelNodes: { hash: Buffer, sum: BigInt }[] = [];
      const levelSize = Math.pow(2, i);
      for (let j = 0; j < levelSize; j++) {
        const path = j.toString(2).padStart(i, '0');
        const node = this.nodes.get(path) || this.defaultNodes[this.height - i];
        levelNodes.push(node);
      }
      console.log(`Level ${i}:`, levelNodes.map(node => ({ hash: node.hash.toString('hex'), sum: node.sum })));
    }
    console.log('Root:', { hash: this.root.hash.toString('hex'), sum: this.root.sum });
  }
}

// Example of a hash function
const hash = (data: Buffer): Buffer => {
  return createHash('sha256').update(data).digest();
};

if (typeof window !== 'undefined') {
  ; (window as any).MerkleSparseSumTree = MerkleSparseSumTree;
}
