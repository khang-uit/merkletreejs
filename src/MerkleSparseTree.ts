import { Base } from './Base';
import { createHash } from 'crypto';

export class MerkleSparseTree extends Base {
  private height: number;
  private defaultNodes: Buffer[];
  private root: Buffer;
  private nodes: Map<string, Buffer>;

  constructor(height: number, leaves: { path: string, value: string }[] = []) {
    super();
    this.height = height;
    this.defaultNodes = this.generateDefaultNodes();
    this.nodes = new Map();
    this.root = this.nodes.get('') || this.defaultNodes[this.height];

    // Insert the initial leaves efficiently
    this.insertLeaves(leaves);
    // Set the root after inserting all leaves
  }

  // Hashing function
  private hash(data: Buffer): Buffer {
    return createHash('sha256').update(data).digest();
  }

  // Generate default nodes for an empty tree
  private generateDefaultNodes(): Buffer[] {
    const defaultNodes = [this.hash(this.bufferify(''))];
    for (let i = 1; i <= this.height; i++) {
      const hash = this.hash(Buffer.concat([defaultNodes[i - 1], defaultNodes[i - 1]]));
      defaultNodes.push(hash);
    }
    return defaultNodes;
  }

  // Get the root of the tree
  getRoot(): string {
    return this.root.toString('hex');
  }

  // Get the node at a given path
  getNode(path: string): string {
    const node = this.nodes.get(path) || this.defaultNodes[this.height - path.length];
    return node.toString('hex');
  }

  // Insert a single leaf into the tree
  insert(path: string, value: string) {
    const leafHash = this.hash(this.bufferify(value));
    this.nodes.set(path, leafHash);
    this.updatePath(path, leafHash);
    this.root = this.nodes.get('') || this.defaultNodes[this.height];
  }

  // Insert multiple leaves into the tree efficiently
  private insertLeaves(leaves: { path: string, value: string }[]) {
    for (const leaf of leaves) {
      const leafHash = this.hash(this.bufferify(leaf.value));
      this.nodes.set(leaf.path, leafHash);
    }
    this.updateBranches();
  }

  // Update the path from a leaf to the root
  private updatePath(path: string, value: Buffer) {
    let currentHash = value;
    let currentPath = path;
    this.nodes.set(currentPath, currentHash);
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingHash = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      if (this.isLeftNode(currentPath)) {
        currentHash = this.hash(Buffer.concat([currentHash, siblingHash]));
      } else {
        currentHash = this.hash(Buffer.concat([siblingHash, currentHash]));
      }
      currentPath = this.getParentPath(currentPath);
      this.nodes.set(currentPath, currentHash);
    }
  }

  // Update all branches of the tree from leaves to root
  private updateBranches() {
    // Bắt đầu từ mức độ sâu nhất (lá) và di chuyển lên đến gốc
    for (let level = this.height - 1; level >= 0; level--) {
      const numNodes = 2 ** level; // Số lượng nút ở mức hiện tại
      for (let index = 0; index < numNodes; index++) {
        let path = ''
        if (level == 0) {
          path = ''
        } else {
          path = index.toString(2).padStart(level, '0');

        }
        const leftChildPath = path + '0';
        const rightChildPath = path + '1';

        // Lấy các giá trị băm của các nút con trái và phải
        const leftChild = this.nodes.get(leftChildPath) || this.defaultNodes[this.height - level - 1];
        const rightChild = this.nodes.get(rightChildPath) || this.defaultNodes[this.height - level - 1];

        // Tính giá trị băm của nút cha từ các nút con
        const parentHash = this.hash(Buffer.concat([leftChild, rightChild]));
        this.nodes.set(path, parentHash); // Cập nhật nút cha
      }
    }
    console.log(this.root)
    // Cập nhật gốc của cây
    this.root = this.nodes.get('') || this.defaultNodes[this.height];
  }

  // Generate a proof for a given key
  generateProof(path: string): string[] {
    const proof = [];
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingPath = this.getSiblingPath(currentPath);
      const siblingHash = this.nodes.get(siblingPath) || this.defaultNodes[this.height - i - 1];
      proof.push(siblingHash.toString('hex'));
      currentPath = this.getParentPath(currentPath);
    }
    return proof;
  }

  // Verify a proof
  verifyProof(path: string, value: string, proof: string[], root: string): boolean {
    let currentHash = this.hash(this.bufferify(value));
    let currentPath = path;
    for (let i = this.height - 1; i >= 0; i--) {
      const siblingHash = this.bufferify(proof[this.height - i - 1]);
      if (this.isLeftNode(currentPath)) {
        currentHash = this.hash(Buffer.concat([currentHash, siblingHash]));
      } else {
        currentHash = this.hash(Buffer.concat([siblingHash, currentHash]));
      }
      currentPath = this.getParentPath(currentPath);
    }
    return currentHash.equals(this.bufferify(root));
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

  // Get all layers of the tree
  getLayers(): any {
    const layers = [];
    for (let i = 0; i <= this.height; i++) {
      const levelNodes = [];
      const levelSize = Math.pow(2, i);
      for (let j = 0; j < levelSize; j++) {
        const path = j.toString(2).padStart(i, '0');
        const hash = this.nodes.get(path) || this.defaultNodes[this.height - i];
        levelNodes.push({ path, hash: hash.toString('hex') });
      }
      layers.push(levelNodes);
    }
    return layers;
  }

  // Get flat layers of the tree
  getFlatLayers(): any {
    const flatLayers = [];
    for (let [path, hash] of this.nodes) {
      flatLayers.push({ path, hash: hash.toString('hex') });
    }
    return flatLayers;
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
        levelNodes.push(hash.toString('hex'));
      }
      console.log(`Level ${i}:`, levelNodes);
    }
    console.log('Root:', this.root.toString('hex'));
  }

  // Visualize the tree
  getTreeVisualization(): string {
    const visualize = (path: string, depth: number, prefix: string): string => {
      const indent = '   '.repeat(depth);
      const hash = this.nodes.get(path) || this.defaultNodes[this.height - path.length];

      if (path.length === this.height) {
        return `${indent}${prefix}${hash.toString('hex')} ${path}\n`;
      }

      const leftChildPath = path + '0';
      const rightChildPath = path + '1';
      const leftChild = this.nodes.get(leftChildPath) || this.defaultNodes[this.height - path.length - 1];
      const rightChild = this.nodes.get(rightChildPath) || this.defaultNodes[this.height - path.length - 1];

      if (!leftChild.equals(rightChild)) {
        return `${indent}${prefix}${hash.toString('hex')} ${path}\n` +
          visualize(leftChildPath, depth + 1, '├─ ') +
          visualize(rightChildPath, depth + 1, '└─ ');
      }

      return `${indent}${prefix}${hash.toString('hex')} ${path}\n` +
        visualize(leftChildPath, depth + 1, '└─ ');
    };

    const rootPath = ''; // Assuming the root path is empty or initialize accordingly
    return visualize(rootPath, 0, '└─ ');
  }
}

if (typeof window !== 'undefined') {
  (window as any).MerkleSparseTree = MerkleSparseTree;
}
