import { calculateMergedHourly } from '../../src/Dashboard';

test('mergedHourly enthält die richtigen Keys', () => {
  const hourlyTotals = [{ time: '00:00', value: 1 }];
  const kitchenHourly = [{ kitchen: 0.5 }];
  const livingHourly = [{ living: 0.3 }];
  const bedroomHourly = [{ bedroom: 0.2 }];

  const result = calculateMergedHourly(hourlyTotals, kitchenHourly, livingHourly, bedroomHourly);

  expect(result[0]).toHaveProperty('time');
  expect(result[0]).toHaveProperty('value');
  expect(result[0]).toHaveProperty('kitchen');
  expect(result[0]).toHaveProperty('living');
  expect(result[0]).toHaveProperty('bedroom');
});
