import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions
} from 'chart.js';

import { Chart } from 'react-chartjs-2';
import type { Analytics, User, Vendor } from '@/types/analytics';
import axios from 'axios';
import { useAuth } from '@/context/authContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    LineElement,
    PointElement,
    Tooltip,
    Legend
);




const VendorHomePage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics>();
  const [vendor, setVendor] = useState<Vendor>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const loadData = async () => {
      try {
        if(!user){
            setError("User not found. PLease login and try again")
        }
        const { data } = await axios.get<Analytics>(`${API_URL}/orders/analytics/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    const loadUser = async ()=>{
        if(!user){
            setError("User not found. Please login and try again")
            return;
        }
        try{
            const { data } = await axios.get<User>(`${API_URL}/users/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if(!data){
            setVendor(undefined)
        }
        else{
        setVendor(data.vendorProfile);   
        }
        }
        catch(err){
            console.error(err);
            setError((err as Error).message);
        } finally {
        setLoading(false);
      }

    }

    loadUser();
    loadData();
  }, []);

    
    const labels = analytics?.monthlySales.map(item => item.month);
    const values = analytics?.monthlySales.map(item => item.sales);
    
    const data: ChartData<'bar', number[], string> = {
    labels,
    datasets: [
        {
            type: 'bar',
            label: 'Sales',
            data: values||[],
            backgroundColor: 'black',
            borderRadius: 4
        }
    ]
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const total = (analytics?.totalSales || 0) + (analytics?.totalInCart || 0);
    const firstPercent = ((analytics?.totalSales||0) / total) * 100;
    const secondPercent = ((analytics?.totalInCart ||0) / total) * 100;


    if (loading) {
        return (
          <>
            <Header page="vendor-home" />
            <main className="flex-grow flex items-center justify-center mt-20">
              <p>Loading Details...</p>
            </main>
            <Footer />
          </>
        );
      }

    return (
        <>
            <Header page="vendor-home"/>
            <main className="flex-grow  container mx-auto px-4 py-8 md:py-12 mt-16">
                <div className="flex gap-6 justify-center items-center">
                    {!analytics ? (
                    <h1 className="flex-grow flex items-center justify-center mt-20">No Sales Data Yet</h1>
                ) : (
                    <div className="w-[70%]  bg-white rounded-lg  overflow-hidden flex flex-col gap-6">
                        <div className="flex flex-col gap-4 w-full p-4 h-[60vh]">
                            <h1 className="text-xl font-semibold">Monthly Orders</h1>
                            <Chart
                              key={JSON.stringify(data) + JSON.stringify(options)}
                              type="bar"
                              data={data}
                              options={options}
                              className="w-full h-full"
                            />

                        </div>

                        <div className="flex gap-6">
                            <div className="flex-1 bg-gray-50 p-4 rounded text-center flex gap-3 items-center flex-col justify-center">
                                <h2 className="text-lg font-semibold text-center">Gross Income</h2>
                                <p className="w-30 h-30 bg-black rounded-full text-center text-white font-bold  text-l flex items-center justify-center">{new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2
                                }).format(analytics.totalRevenue)}</p>
                            </div>

                            <div className="flex-1 p-4 rounded bg-gray-50 flex flex-col ">
                                <h2 className="text-lg font-semibold text-center mb-2">Products Still in Cart</h2>
                                <div className="flex justify-between font-semibold text-l text-black mt-2">
                                    <span>{analytics.totalSales}</span>
                                    <span>{analytics.totalInCart}</span>
                                </div>
                                <div className="w-full h-6 rounded overflow-hidden flex bg-gray-200 ">
                                    <div className="bg-black" style={{ width: `${firstPercent}%` }} />
                                    <div className="bg-gray-400" style={{ width: `${secondPercent}%` }} />
                                </div>
                                <div className="flex justify-between text-m text-black mt-2">
                                    <span>Total Items Sold</span>
                                    <span>Products in Cart</span>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
                    <div className="w-[25%] h-[50%] bg-white rounded-lg border border-gray-300 overflow-hidden p-4 md:p-8 flex flex-col ">
                        <img src={vendor?.storeImage||"https://roofwizards.com/wp-content/plugins/elementor/assets/images/placeholder.png"} alt={"Store Image"} className="w-full object-cover" />
                        <h2 className='font-semibold py-2 text-center'>{vendor?.storeName||"N/A"}</h2>
                        <Link to="/vendor-products" className="self-center">
                            <Button className="w-full md:w-auto">View Products in Store</Button>
                        </Link>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default VendorHomePage;
