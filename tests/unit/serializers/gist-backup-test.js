import { moduleForModel, test } from 'ember-qunit';

moduleForModel('gist-backup', 'Unit | Serializer | gist backup', {
  // Specify the other units that are required for this test.
  needs: ['serializer:gist-backup']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
