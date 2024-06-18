// const test = require('tape')
// const crypto = require('crypto')
// const { PatriciaMerkleTree } = require('../')

// // Custom SHA256 function using crypto
// const sha256 = (data) => {
//   if (!data) {
//     data = ''
//   }
//   return crypto.createHash('sha256').update(data).digest()
// }

// // Function to create a simple hash function for the test
// // Helper function to visualize the tree structure
// // function visualizeTree (tree) {
// //   function printNode (node, depth = 0) {
// //     const indent = '  '.repeat(depth)
// //     Object.keys(node.children).forEach(key => {
// //       console.log(indent + key)
// //       printNode(node.children[key], depth + 1)
// //     })
// //   }

// //   console.log('Tree Structure:')
// //   printNode(tree.root)
// // }

// // test('PatriciaMerkleTree basic functionality', t => {
// //   t.plan(7)

// //   const tree = new PatriciaMerkleTree()

// //   tree.insert('key1', 'value1')
// //   tree.insert('key2', 'value2')
// //   tree.insert('key3', 'value3')

// //   t.equal(tree.get('key1'), 'value1', 'Value for key1 should be value1')
// //   t.equal(tree.get('key2'), 'value2', 'Value for key2 should be value2')
// //   t.equal(tree.get('key3'), 'value3', 'Value for key3 should be value3')
// //   t.equal(tree.get('key4'), null, 'Value for key4 should be null')

// //   const rootHash = tree.getRootHash()
// //   t.ok(rootHash instanceof Buffer, 'Root hash should be a Buffer')
// //   t.ok(rootHash.length > 0, 'Root hash should not be empty')

// //   // Log the tree structure
// //   visualizeTree(tree)

// //   // Insert another value and check the root hash again
// //   tree.insert('key4', 'value4')
// //   const newRootHash = tree.getRootHash()
// //   t.notEqual(rootHash.toString('hex'), newRootHash.toString('hex'), 'Root hash should change after adding a new key')

// //   // Log the updated tree structure
// //   visualizeTree(tree)
// //   t.end()
// // })

// test('PatriciaMerkleTree with custom hash function', t => {
//   t.plan(4)

//   const customHashFunction = sha256
//   const customTree = new PatriciaMerkleTree({ hashFunction: customHashFunction })

//   customTree.insert('key1', 'value1')
//   customTree.insert('key2', 'value2')
//   customTree.insert('key3', 'value3')

//   const rootHash = customTree.getRootHash()
//   t.ok(rootHash instanceof Buffer, 'Root hash should be a Buffer')
//   t.ok(rootHash.length > 0, 'Root hash should not be empty')

//   // Check the value retrieval
//   t.equal(customTree.get('key1'), 'value1', 'Value for key1 should be value1')
//   t.equal(customTree.get('key2'), 'value2', 'Value for key2 should be value2')

//   // Log the custom tree structure
//   t.end()
// })

// test('PatriciaMerkleTree getProof and verifyProof methods', t => {
//   t.plan(2)

//   const customTree = new PatriciaMerkleTree({ hashFunction: sha256 })

//   customTree.insert('key1', 'value1')
//   customTree.insert('key2', 'value2')
//   customTree.insert('key3', 'value3')

//   const rootHash = customTree.getRootHash()
//   console.log(`Root hash: ${rootHash.toString('hex')}`)

//   // Get proof for key1
//   const proofForKey1 = customTree.getProof('key1')
//   t.ok(customTree.verifyProof('key1', proofForKey1, rootHash), 'Proof for key1 should be verified correctly')

//   // Get proof for key2
//   const proofForKey2 = customTree.getProof('key1')
//   t.ok(customTree.verifyProof('key2', proofForKey2, rootHash), 'Proof for key2 should be verified correctly')

//   t.end()
// })
