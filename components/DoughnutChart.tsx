"use client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({accounts}: DoughnutChartProps) => {
    const data = {
        datasets: [
            {
                label:"Banks",
                data: [1250, 2000, 3400],
                backgroundColor: ["#0747b6", "#2265d8", "#2f91fa"],
            }
        ],
        labels: ['Bank1', 'Bank2', 'Bank3']
    }
    return <Doughnut
        data={data}
        options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }}
    />;
}

export default DoughnutChart