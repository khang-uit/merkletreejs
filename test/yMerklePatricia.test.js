const { MerklePatricia } = require('../')
const test = require('tape') // adjust the import according to your file structure

// Test suite for PatriciaMerkleTree getProof and verifyProof methods
test('PatriciaMerkleTree getProof and verifyProof methods', t => {
  t.plan(2)

  const customTree = new MerklePatricia()

  customTree.insert('1a2b3c', 'value1')
  customTree.insert('1a3c2d', 'value1')
  customTree.insert('3c4d3c', 'value2')

  const rootHash = customTree.root.hash()
  console.log(`Root hash: ${rootHash}`)

  // Get proof for 1a2b3c
  const proofForKey1 = customTree.generateProof('1a2b3c')
  console.log(proofForKey1)
  t.ok(customTree.verifyProof(rootHash, '1a2b3c', proofForKey1), 'Proof for 1a2b3c should be verified correctly')

  // Get proof for 3c4d3c
  const proofForKey2 = customTree.generateProof('3c4d3c')
  t.ok(customTree.verifyProof(rootHash, '3c4d3c', proofForKey2), 'Proof for 3c4d3c should be verified correctly')

  t.end()
})

// Test suite for PatriciaMerkleTree handling non-existent keys
test('PatriciaMerkleTree handling non-existent keys', t => {
  t.plan(2)

  // Initialize the Merkle Patricia Trie
  const customTree = new MerklePatricia()

  // Insert some key-value pairs
  customTree.insert('1a2b3c', 'value1')
  customTree.insert('1a2b4d', 'value3')
  customTree.insert('3c4d5e', 'value2')

  const rootHash = customTree.root.hash()

  // Attempt to generate proof for a key that doesn't exist
  const proofForNonExistentKey = customTree.generateProof('1a2b3f') // Key that doesn't exist
  console.log(proofForNonExistentKey)

  // Assert that the proof for the non-existent key is empty
  t.equal(proofForNonExistentKey.length, 0, 'Proof for non-existent key should be empty')

  // Verify that the proof for the non-existent key cannot be verified
  const isProofValid = customTree.verifyProof(rootHash, '1a2b3f', proofForNonExistentKey)
  t.notOk(isProofValid, 'Proof for non-existent key should not be valid')

  t.end()
})
