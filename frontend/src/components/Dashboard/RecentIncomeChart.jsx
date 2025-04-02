import React, { useEffect, useState } from 'react'
import CustomPieChart from '../Charts/CustomPieChart';

const COLORS = ["#875cf5", "#fa2c37", "#ff6900", "#4f39f6"];

const RecentIncomeChart = ({ data, totalIncome }) => {

    const [chartData, setChartData] = useState([]);
    const prepareChartData = () => {
        const dataArr = data?.map((item) => ({
            name: item?.source,
            amount: item?.amount
        }));

        setChartData(dataArr);
    };

    useEffect(() => {
        prepareChartData();

        return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

  return (
    <div className="card">
        <div className="flex items-center justify-between">
            <h5 className='text-lg'>Last 60 Days Income</h5>
        </div>

        <CustomPieChart
            data={chartData}
            label="Total Income"
            totalAmount={`${totalIncome}`}
            showTextAnchor
            colors={COLORS}
        />    
    </div>
  )
}

export default RecentIncomeChart