import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

import Note from '../Note';
import NumberInput from '../NumberInput';
import P from '../P';
import Section from '../Section';
import Table, { Row, TD, TH, THead, TBody, TFoot } from '../Table';

import {
	orderByPosition,
	percentage,
	round2,
	volume,
	ethanol,
	sugar,
	acid,
	convertToMl,
	convertToUnit
} from './utilities';

const normalizeOption = ({ id, name }) => ({
	label: name,
	value: id
});

const StyledSelect = styled(Select).withConfig({
	displayName: 'StyledSelect'
})`
	& .Select-control {
		background-color: inherit;
		border-style: none;

		&:hover {
			box-shadow: none;
		}
	}

	& .Select-placeholder,
	&.Select--single > .Select-control .Select-value {
		padding-left: 0;
	}

	& .Select-option.is-focused {
		background-color: #FEFEAE;
	}

	@media screen and (min-width: 640px) {
		min-width: 200px;
	}
`;

const NotesHeader = TH.extend.withConfig({
	displayName: 'NotesHeader'
})`
	@media screen and (min-width: 641px) {
		width: 40%;
	}
`;

const Notes = TD.extend.withConfig({
	displayName: 'Notes'
})`
	@media screen and (max-width: 640px) {
		&[data-label] {
			padding-left: ${p => p['data-label'].length}ch;
		}
	}
`;

class Ingredients extends React.PureComponent {
	componentDidMount() {
		this.props.fetchAvailable();
	}

	handleAddIngredient({ value }) {
		const position = this.props.measurements.length;
		this.props.onAdd(value, NaN, position);
	}

	handleChangeIngredient(option, oldSelectedId, amount) {
		if (option) {
			const { value } = option;
			const oldSelected = this.props.measurements.find(
				({ id }) => id === oldSelectedId
			);
			this.props.onRemove(oldSelectedId);
			this.props.onAdd(value, amount, oldSelected.position);
		} else {
			this.props.onRemove(oldSelectedId);
		}
	}

	handleChangeAmount(ingredientId, value) {
		const { unit } = this.props;
		const rawAmount = parseFloat(value);
		const amount = convertToMl(unit, rawAmount);
		const selected = this.props.measurements.find(({ id }) => id === ingredientId);
		this.props.onUpdate(ingredientId, amount, selected.position);
	}

	renderError() {
		const { error } = this.props;
		return error ? <P>{error}</P> : null;
	}

	renderMeasurements() {
		const { measurements, unit } = this.props;

		const step = (unit.code === 'ml') ? 1 : 0.25;

		const renderMeasurement = m => <Row key={m.id}>
			<TD writable>
				{this.renderSelector(m.id, m.amount, e => this.handleChangeIngredient(e, m.id, m.amount))}
			</TD>
			<TD data-label={`Measurement (${unit.code})`} type="number" writable>
				<NumberInput
					{...{ step }}
					onChange={value => this.handleChangeAmount(m.id, value)}
					value={convertToUnit(unit, m.amount).toFixed(unit.precision)}
				/>
			</TD>
			<TD data-label="Ethanol (%abv)" type="number">{percentage(m.ethanol)}</TD>
			<TD data-label="Sugar (g/100ml)" type="number">{round2(m.sugar)}</TD>
			<TD data-label="Acid (%)" type="number">{percentage(m.acid)}</TD>
			<Notes
				dangerouslySetInnerHTML={{
					__html: m.description
				}}
				data-label="Notes/Pairings"
			/>
		</Row>;

		return [ ...measurements ].sort(orderByPosition).map(renderMeasurement);
	}

	renderSelector(selectedId, amount, onChange) {
		const { available, measurements } = this.props;
		const selectedIds = measurements.map(({ id }) => id);

		const selected = available.find(({ id }) => id === selectedId);
		const unselected = available.filter(({ id }) => !selectedIds.includes(id));

		const options = (selected ? [ selected, ...unselected ] : available).sort(orderByPosition);

		return <StyledSelect
			{...{ onChange }}
			backspaceRemoves={false}
			deleteRemoves={false}
			options={options.map(normalizeOption)}
			placeholder="Select Ingredient"
			required
			value={selectedId}
		/>;
	}

	render() {
		const { measurements, unit } = this.props;

		return <Section title="Step 2: Ingredients">
			<P>Select or search for your ingredients from the dropdown list, then add measurements</P>

			{this.renderError()}

			<Table>
				<THead>
					<Row>
						<TH>Ingredient</TH>
						<TH>{`Measurement (${unit.code})`}</TH>
						<TH>Ethanol (%abv)</TH>
						<TH>Sugar (g/100ml)</TH>
						<TH>Acid (%)</TH>
						<NotesHeader>Notes/Pairings</NotesHeader>
					</Row>
				</THead>

				<TBody>
					{this.renderMeasurements()}
					<Row>
						<TD writable>
							{this.renderSelector(undefined, 0, e => this.handleAddIngredient(e))}
						</TD>
						<TD colSpan={5} data-hide />
					</Row>
				</TBody>

				<TFoot>
					<Row>
						<TH>Initial Totals</TH>
						<TD data-label={`Volume (${unit.code})`} type="number">
							<output><NumberInput
								readOnly
								value={convertToUnit(unit, volume(measurements)).toFixed(unit.precision)}
							/></output>
						</TD>
						<TD data-label="Ethanol (%abv)" type="number">
							<output>{percentage(ethanol(measurements))}</output>
						</TD>
						<TD data-label="Sugar (g/100ml)" type="number">
							<output>{round2(sugar(measurements))}</output>
						</TD>
						<TD data-label="Acid (%)" type="number">
							<output>{percentage(acid(measurements))}</output>
						</TD>
						<TD data-hide />
					</Row>
				</TFoot>
			</Table>

			<Note title="dash" description="0.8 ml or 0.027 oz" />
			<Note title="barspoon" description="4 ml or ~0.125 oz" />
		</Section>;
	}
}

Ingredients.propTypes = {
	available: PropTypes.arrayOf(PropTypes.object).isRequired,
	error: PropTypes.string.isRequired,
	fetchAvailable: PropTypes.func.isRequired,
	measurements: PropTypes.arrayOf(PropTypes.object).isRequired,
	onAdd: PropTypes.func.isRequired,
	onUpdate: PropTypes.func.isRequired,
	onRemove: PropTypes.func.isRequired,
	unit: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default Ingredients;
