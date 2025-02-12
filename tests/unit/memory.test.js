// tests/unit/memory.test.js

const {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('Memory Database Functions', () => {
  const ownerId = 'user123';
  const fragmentId = 'frag1';
  const fragmentData = { id: fragmentId, ownerId, type: 'text/plain', size: 100 };
  const fragmentBuffer = Buffer.from('This is test fragment data');

  beforeEach(async () => {
    // Ensure fresh state for each test
    await writeFragment(fragmentData);
    await writeFragmentData(ownerId, fragmentId, fragmentBuffer);
  });

  afterEach(async () => {
    // Cleanup after each test
    await deleteFragment(ownerId, fragmentId);
  });

  test('writeFragment stores fragment metadata', async () => {
    const storedFragment = await readFragment(ownerId, fragmentId);
    expect(storedFragment).toEqual(fragmentData);
  });

  test('readFragment retrieves correct fragment metadata', async () => {
    const retrievedFragment = await readFragment(ownerId, fragmentId);
    expect(retrievedFragment).toEqual(fragmentData);
  });

  test('writeFragmentData stores fragment data', async () => {
    const storedData = await readFragmentData(ownerId, fragmentId);
    expect(storedData).toEqual(fragmentBuffer);
  });

  test('readFragmentData retrieves correct fragment data', async () => {
    const retrievedData = await readFragmentData(ownerId, fragmentId);
    expect(retrievedData).toEqual(fragmentBuffer);
  });

  test('listFragments returns fragment IDs when expand=false', async () => {
    const fragments = await listFragments(ownerId, false);
    expect(fragments).toContain(fragmentId);
  });

  test('listFragments returns full fragment objects when expand=true', async () => {
    const fragments = await listFragments(ownerId, true);
    expect(fragments).toEqual([fragmentData]);
  });

  test('deleteFragment removes both metadata and data', async () => {
    await deleteFragment(ownerId, fragmentId);
    const deletedMetadata = await readFragment(ownerId, fragmentId);
    const deletedData = await readFragmentData(ownerId, fragmentId);

    expect(deletedMetadata).toBeUndefined();
    expect(deletedData).toBeUndefined();
  });
});
