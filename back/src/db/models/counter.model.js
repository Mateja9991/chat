const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');

const CounterSchema = Schema({
	_id: { type: String, required: true },
	seq: { type: Number, default: 0 },
});
const Counter = model(MODEL_PROPERTIES.COUNTER.NAME, CounterSchema);

module.exports = Counter;
