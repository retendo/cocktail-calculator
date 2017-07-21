import PropTypes from 'prop-types';
import React from 'react';

import Section, { SectionTitle } from '../../components/Section';

const renderOption = ({ id, name }) => <option key={id} value={id}>
	{name}
</option>;

renderOption.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired
};

const findSelected = (available, selectedId) => available.find(
	technique => technique.id === selectedId
);

const Technique = ({ available, onChange, selectedId }) => {
	const selected = findSelected(available, selectedId);

	return <Section>
		<SectionTitle>Technique</SectionTitle>
		<p>Select the type of cocktail</p>
		<select {...{ onChange }} value={selectedId}>
			{available.map(renderOption)}
		</select>
		<div dangerouslySetInnerHTML={{ __html: selected && selected.description }} />
	</Section>;
};

Technique.propTypes = {
	available: PropTypes.arrayOf(PropTypes.object).isRequired,
	onChange: PropTypes.func.isRequired,
	selectedId: PropTypes.string.isRequired
};

export default Technique;
