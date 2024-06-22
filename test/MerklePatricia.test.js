const test = require('tape')
const { MerklePatricia } = require('../')

// Test suite for PatriciaMerkleTree getProof and verifyProof methods
test('PatriciaMerkleTree getProof and verifyProof methods', t => {
  t.plan(2)

  const customTree = new MerklePatricia()

  customTree.put('11355', 'value1')
  customTree.put('7d337', 'value2')
  customTree.put('f9365', 'value3')
  customTree.put('7d397', 'value4')

  const rootHash = customTree.rootHash

  // Get proof for 1a2b3c
  const proofForKey1 = customTree.generateProof('11355')
  // console.log(proofForKey1)
  t.ok(customTree.verifyProof(rootHash, '11355', proofForKey1), 'Proof for 11355 should be verified correctly')

  // Get proof for 3c4d3c
  const proofForKey2 = customTree.generateProof('7d337')
  // console.log(proofForKey2)
  t.ok(customTree.verifyProof(rootHash, '7d337', proofForKey2), 'Proof for 7d337 should be verified correctly')

  t.end()
})

// Test suite for PatriciaMerkleTree handling non-existent keys
test('PatriciaMerkleTree handling non-existent keys', t => {
  t.plan(1)

  // Initialize the Merkle Patricia Trie
  const customTree = new MerklePatricia()

  // Insert some key-value pairs
  customTree.put('11355', 'value1')
  customTree.put('7d337', 'value2')
  customTree.put('f9365', 'value3')
  customTree.put('7d397', 'value4')

  const rootHash = customTree.rootHash

  // Attempt to generate proof for a key that doesn't exist
  const proofForNonExistentKey = customTree.generateProof('7d336') // Key that doesn't exist

  // Verify that the proof for the non-existent key cannot be verified
  const isProofValid = customTree.verifyProof(rootHash, '7d336', proofForNonExistentKey)
  t.notOk(isProofValid, 'Proof for non-existent key should not be valid')

  t.end()
})
