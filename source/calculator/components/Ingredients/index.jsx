import PropTypes from 'prop-types';
import React from 'react';

import Section, { SectionTitle } from '../../components/Section';

import { BLANK_OPTION } from './constants';

import {
	orderByPosition,
	round,
	volume
} from './utilities';

class Ingredients extends React.PureComponent {
	handleAddIngredient({ target }) {
		this.props.onAdd(target.value, 0);
	}

	handleChangeIngredient({ target }) {
		const amount = parseFloat(target.dataset.amount, 10);
		this.props.onRemove(target.dataset.ingredientId);
		this.props.onAdd(target.value, amount);
	}

	handleChangeAmount({ target }) {
		const amount = parseFloat(target.value, 10);
		this.props.onUpdate(target.dataset.ingredientId, amount);
	}

	handleRemoveIngredient({ target }) {
		this.props.onRemove(target.dataset.ingredientId);
	}

	renderError() {
		const { error } = this.props;
		return error ? <p>{error}</p> : null;
	}

	renderMeasurements() {
		const { measurements } = this.props;

		const renderMeasurement = ({ id, amount, ethanol, sugar, acid }) => <tr key={id}>
			<td>
				<button
					onClick={e => this.handleRemoveIngredient(e)}
					data-ingredient-id={id}
					type="button"
				>remove</button>
			</td>
			<td>{this.renderSelector(id, amount, e => this.handleChangeIngredient(e))}</td>
			<td>
				<input
					data-ingredient-id={id}
					onChange={e => this.handleChangeAmount(e)}
					type="number"
					value={amount}
				/>
			</td>
			<td>{ethanol}</td>
			<td>{sugar}</td>
			<td>{acid}</td>
		</tr>;

		return measurements.map(renderMeasurement);
	}

	renderNewMeasurement() {
		const { measurements } = this.props;

		if (measurements.every(({ amount }) => amount > 0)) {
			return <tr>
				<td />
				<td>{this.renderSelector(BLANK_OPTION.id, 0, e => this.handleAddIngredient(e))}</td>
				<td colSpan={4} />
			</tr>;
		} else {
			return null;
		}
	}

	renderSelector(selectedId, amount, onChange) {
		const { available, measurements } = this.props;
		const selectedIds = measurements.map(({ id }) => id);

		const selected = available.find(({ id }) => id === selectedId);
		const unselected = available.filter(({ id }) => !selectedIds.includes(id));

		const options = [
			(selected || BLANK_OPTION),
			...unselected
		].sort(orderByPosition);

		const wrapOption = ({ id, name }) => <option key={id} value={id}>{name}</option>;

		return <select
			{...{ onChange }}
			data-amount={amount}
			data-ingredient-id={selectedId}
			value={selectedId}
		>{options.map(wrapOption)}</select>;
	}

	render() {
		const { measurements } = this.props;

		return <Section>
			<SectionTitle>Ingredients</SectionTitle>
			<p>Select or search for ingredients and add measurements</p>

			{this.renderError()}

			<table>
				<thead>
					<tr>
						<th />
						<th>Ingredient</th>
						<th>Measurement</th>
						<th>Ethanol (%abv)</th>
						<th>Sugar (g/100mg)</th>
						<th>Acid (%)</th>
					</tr>
				</thead>

				<tbody>
					{this.renderMeasurements()}
					{this.renderNewMeasurement()}
				</tbody>

				<tfoot>
					<tr>
						<th colSpan={2}>Initial Totals</th>
						<td>{round(volume(measurements))}</td>
						<td>{}</td>
						<td>{}</td>
						<td>{}</td>
					</tr>
				</tfoot>
			</table>
		</Section>;
	}
}

Ingredients.propTypes = {
	available: PropTypes.arrayOf(PropTypes.object).isRequired,
	error: PropTypes.string.isRequired,
	measurements: PropTypes.arrayOf(PropTypes.object).isRequired,
	onAdd: PropTypes.func.isRequired,
	onUpdate: PropTypes.func.isRequired,
	onRemove: PropTypes.func.isRequired
};

export default Ingredients;
