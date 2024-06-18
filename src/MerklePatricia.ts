import * as crypto from 'crypto'

class Node {
    nodeType: string;
    value: string | null;
    children: (Node | null)[];
    key: number[] | null;

    constructor (nodeType: string) {
      this.nodeType = nodeType // 'branch', 'leaf', or 'extension'
      this.value = null
      this.children = new Array(16).fill(null)
      this.key = null // For leaf and extension nodes
    }

    hash (): string {
      if (this.nodeType === 'branch') {
        let data = this.children.map(child => child ? child.hash() : '').join('')
        if (this.value) {
          data += this.value
        }
        return crypto.createHash('sha256').update(data).digest('hex')
      } else if (this.nodeType === 'leaf' || this.nodeType === 'extension') {
        const keyString = this.key ? this.key.map(n => n.toString(16)).join('') : ''
        return crypto.createHash('sha256').update(keyString + (this.value as string)).digest('hex')
      } else {
        return ''
      }
    }
}

export class MerklePatricia {
    root: Node;

    constructor () {
      this.root = new Node('branch')
    }

    insert (key: string, value: string): void {
      const path = this.hexToPath(key)
      this._insert(this.root, path, value)
    }

    private _insert (node: Node, path: number[], value: string): void {
      if (path.length === 0) {
        node.value = value
        return
      }
      const index = path[0]
      if (!node.children[index]) {
        if (path.length === 1) {
          const newNode = new Node('leaf')
          newNode.key = path
          newNode.value = value
          node.children[index] = newNode
        } else {
          const newNode = new Node('extension')
          newNode.key = path
          newNode.value = value
          node.children[index] = newNode
        }
      } else {
        const child = node.children[index]!
        if (child.nodeType === 'leaf' || child.nodeType === 'extension') {
          const commonPrefixLength = this.commonPrefixLength(path, child.key!)
          const newExtension = new Node('extension')
          newExtension.key = path.slice(0, commonPrefixLength)
          const newBranch = new Node('branch')
          newExtension.children[path[commonPrefixLength]] = newBranch
          child.key = child.key!.slice(commonPrefixLength + 1)
          newBranch.children[child.key![0]] = child
          newBranch.children[path[commonPrefixLength + 1]] = new Node('leaf')
                newBranch.children[path[commonPrefixLength + 1]]!.key = path.slice(commonPrefixLength + 1)
                newBranch.children[path[commonPrefixLength + 1]]!.value = value
                node.children[index] = newExtension
        } else {
          this._insert(child, path.slice(1), value)
        }
      }
    }

    get (key: string): string | null {
      const path = this.hexToPath(key)
      let node = this.root
      for (const index of path) {
        if (node.children[index]) {
          node = node.children[index]!
        } else {
          return null
        }
      }
      return node.value
    }

    generateProof (key: string): Node[] {
      const path = this.hexToPath(key)
      const proof: Node[] = []
      this._generateProof(this.root, path, proof)
      return proof
    }

    private _generateProof (node: Node, path: number[], proof: Node[]): void {
      proof.push(node)
      if (path.length === 0) {
        return
      }
      const index = path[0]
      if (node.children[index]) {
        this._generateProof(node.children[index]!, path.slice(1), proof)
      }
    }

    verifyProof (rootHash: string, key: string, proof: Node[]): boolean {
      const path = this.hexToPath(key)
      let currentHash = rootHash
      for (const node of proof) {
        const nodeHash = node.hash()
        if (currentHash !== nodeHash) {
          return false
        }
        if (path.length > 0) {
          const index = path[0]
          console.log(index)
          path.shift()
          currentHash = node.children[index]?.hash() ?? ''
        } else {
          break
        }
      }
      return true
    }

    private hexToPath (key: string): number[] {
      const path: number[] = []
      for (const char of key) {
        const nibble = parseInt(char, 16)
        path.push(nibble)
      }
      return path
    }

    private commonPrefixLength (a: number[], b: number[]): number {
      let length = 0
      while (length < a.length && length < b.length && a[length] === b[length]) {
        length++
      }
      return length
    }
}
