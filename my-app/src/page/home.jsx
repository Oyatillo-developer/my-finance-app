import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/home.scss';

const CurrencyList = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Markaziy Bank API URL
  const apiUrl = `https://cbu.uz/uz/arkhiv-kursov-valyut/json/`;

  useEffect(() => {
    // API'dan valyuta kurslarini olish
    const fetchCurrencyData = async () => {
      try {
        const response = await axios.get(apiUrl);

        // API'dan qaytgan barcha valyutalarni olish
        const data = response.data;

        // USD valyutasini topish va saqlash
        const filteredData = data.map((item) => ({
          currency: item.Ccy, // Valyuta nomi (USD, EUR va h.k.)
          rate: parseFloat(item.Rate), // Kurs qiymati
          name: item.CcyNm_UZ, // Valyuta to‘liq nomi
        }));

        setCurrencies(filteredData); // State ni yangilash
        setLoading(false);
      } catch (error) {
        console.error("API xatosi:", error);
        setError("API bilan bog'lanishda xatolik yuz berdi.");
        setLoading(false);
      }
    };

    fetchCurrencyData();
  }, []); // Faqat bir marta ishlaydi

  if (loading) {
    return <div>Yuklanmoqda...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="currency-list">
      <h3>Valyuta Kurslari</h3>
      <ul>
        {currencies.map(({ currency, rate, name }, index) => (
          <li key={index} className="currency-item">
            <div className="currency-name">
              <span>{currency} ({name})</span>
            </div>
            <div className="currency-rate">{rate.toFixed(2)} UZS</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyList;
