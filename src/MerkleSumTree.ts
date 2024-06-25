import { Base } from './Base'
import { createHash } from 'crypto';

// @credit: https://github.com/finalitylabs/pymst

type TValue = Buffer | BigInt | string | number | null | undefined

export class Bucket {
  size: BigInt
  hashed: Buffer
  parent: Bucket | null
  left: Bucket | null
  right: Bucket | null

  constructor (size: BigInt | number, hashed: Buffer) {
    this.size = BigInt(size)
    this.hashed = hashed

    // each node in the tree can have a parent, and a left or right sibling
    this.parent = null
    this.left = null
    this.right = null
  }
}

export class Leaf {
  rng: BigInt[]
  data: Buffer | null

  constructor (rng: (number | BigInt)[], data: string | null) {
    this.rng = rng.map(x => BigInt(x))
    this.data = data ? Buffer.from(data) : null
  }

  private hash(data: Buffer): Buffer {
    return createHash('sha256').update(data).digest();
  }

  getBucket () {
    let hashed : Buffer
    if (this.data) {
      hashed = this.hash(this.data)
    } else {
      hashed = Buffer.alloc(32)
    }
    return new Bucket(BigInt(this.rng[1]) - BigInt(this.rng[0]), hashed)
  }
}

export class ProofStep {
  bucket: Bucket
  right: boolean

  constructor (bucket: Bucket, right: boolean) {
    this.bucket = bucket
    this.right = right // whether the bucket hash should be appeded on the right side in this step (default is left
  }
}

export class MerkleSumTree extends Base {
  leaves: Leaf[];
  buckets: Bucket[];
  root: Bucket;

  constructor(leaves: Leaf[]) {
    super();
    this.leaves = leaves;

    MerkleSumTree.checkConsecutive(leaves);

    this.buckets = [];
    for (const l of leaves) {
      this.buckets.push(l.getBucket());
    }

    let buckets = [];
    for (const bucket of this.buckets) {
      buckets.push(bucket);
    }

    while (buckets.length !== 1) {
      const newBuckets = [];
      while (buckets.length) {
        if (buckets.length >= 2) {
          const b1 = buckets.shift();
          const b2 = buckets.shift();
          const size = b1.size + b2.size;
          const hashed = this.hash(
            Buffer.concat([
              this.sizeToBuffer(b1.size),
              this.bufferify(b1.hashed),
              this.sizeToBuffer(b2.size),
              this.bufferify(b2.hashed),
            ])
          );
          const b = new Bucket(size, hashed);
          b2.parent = b;
          b1.parent = b2.parent;
          b1.right = b2;
          b2.left = b1;
          newBuckets.push(b);
        } else {
          newBuckets.push(buckets.shift());
        }
      }
      buckets = newBuckets;
    }
    this.root = buckets[0];
  }

  private hash(data: Buffer): Buffer {
    return createHash('sha256').update(data).digest();
  }

  sizeToBuffer(size: BigInt) {
    const buf = Buffer.alloc(8);
    const view = new DataView(buf.buffer);
    view.setBigInt64(0, BigInt(size), false); // true when little endian
    return buf;
  }

  static checkConsecutive(leaves: Leaf[]) {
    let curr = BigInt(0);
    for (const leaf of leaves) {
      if (leaf.rng[0] !== curr) {
        throw new Error('leaf ranges are invalid');
      }
      curr = BigInt(leaf.rng[1]);
    }
  }

  // gets inclusion/exclusion proof of a bucket in the specified index
  getProof (index: number | BigInt) {
    let curr = this.buckets[Number(index)]
    const proof = []
    while (curr && curr.parent) {
      const right = !!curr.right
      const bucket = curr.right ? curr.right : curr.left
      curr = curr.parent
      proof.push(new ProofStep(bucket, right))
    }
    return proof
  }

  sum (arr: BigInt[]) {
    let total = BigInt(0)
    for (const value of arr) {
      total += BigInt(value)
    }
    return total
  }

  // validates the suppplied proof for a specified leaf according to the root bucket
  verifyProof (root: Bucket, leaf: Leaf, proof: ProofStep[]) {
    const rng = [this.sum(proof.filter(x => !x.right).map(x => x.bucket.size)), BigInt(root.size) - this.sum(proof.filter(x => x.right).map(x => x.bucket.size))]
    if (!(rng[0] === leaf.rng[0] && rng[1] === leaf.rng[1])) {
      // supplied steps are not routing to the range specified
      return false;
    }
    let curr = leaf.getBucket();
    let hashed: Buffer;
    for (const step of proof) {
      if (step.right) {
        hashed = this.hash(
          Buffer.concat([
            this.sizeToBuffer(curr.size),
            this.bufferify(curr.hashed),
            this.sizeToBuffer(step.bucket.size),
            this.bufferify(step.bucket.hashed),
          ])
        );
      } else {
        hashed = this.hash(
          Buffer.concat([
            this.sizeToBuffer(step.bucket.size),
            this.bufferify(step.bucket.hashed), 
            this.sizeToBuffer(curr.size),
            this.bufferify(curr.hashed),
          ])
        );
      }
      curr = new Bucket(BigInt(curr.size) + BigInt(step.bucket.size), hashed);
    }
    return curr.size === root.size && curr.hashed.toString('hex') === root.hashed.toString('hex');
  }

  bufferify(buf: Buffer) {
    return buf;
  }

  getLayers() {
    const layers = [];
    let currentLayer = this.buckets;
    while (currentLayer.length > 0) {
      layers.push(currentLayer.map((bucket) => ({ size: bucket.size, hash: bucket.hashed.toString('hex') })));
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(currentLayer[i].parent);
        }
      }
      currentLayer = nextLayer;
    }
    return layers;
  }


  getTreeVisualization() {
    const visualize = (bucket, level = 0) => {
      if (!bucket) return '';
      let result = '  '.repeat(level) + `Size: ${bucket.size}, Hash: ${bucket.hashed.toString('hex')}\n`;
      if (bucket.left) result += visualize(bucket.left, level + 1);
      if (bucket.right) result += visualize(bucket.right, level + 1);
      return result;
    };
    return visualize(this.root);
  }
}


if (typeof window !== 'undefined') {
  ;(window as any).MerkleSumTree = MerkleSumTree
  ;(window as any).MerkleSumTreeLeaf = Leaf
}
