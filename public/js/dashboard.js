// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // const content = document.getElementById("content-area");


  // Select the canvas element
const ctx = document.getElementById('salesChart').getContext('2d');

// Sample data for the chart
const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [{
        label: 'Monthly Sales ($)',
        data: [1200, 1900, 3000, 2500, 4000, 3500],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // bar fill color
        borderColor: 'rgba(54, 162, 235, 1)',       // bar border color
        borderWidth: 1
    }]
};

// Chart configuration
const config = {
    type: 'bar', // can be 'line', 'pie', etc.
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sales Dashboard'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    },
};

// Create and render the chart
const salesChart = new Chart(ctx, config);





  // Dark mode toggle
  document.getElementById("nightModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });


});
