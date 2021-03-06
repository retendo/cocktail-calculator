import { connect } from 'react-redux';

import Result from '../../components/Result';

import * as TECHNIQUE from '../Introduction/constants_technique';
import * as UNIT from '../Introduction/constants_unit';

const findBy = property => items => value => items.find(item => item[property] === value);

const mapStateToProps = ({ ingredient, technique, unit }) => {
	const findIngredientById = findBy('id')(ingredient.available);

	return {
		ingredients: ingredient.measurements.map(
			({ amount, id }) => Object.assign({}, findIngredientById(id), { amount })
		),
		technique: findBy('code')(TECHNIQUE.AVAILABLE)(technique.selectedCode),
		unit: findBy('code')(UNIT.AVAILABLE)(unit.selectedCode)
	};
};

export default connect(mapStateToProps)(Result);
