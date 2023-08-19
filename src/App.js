import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import './App.css';

import JSONPretty from 'react-json-pretty';
var JSONPrettyMon = require('react-json-pretty/dist/monikai');


// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockDetails, setBlockDetails] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [jsonData, setJsonData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const transactionsPerPage = 10;

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  });

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (showPopup && !event.target.closest('.popup-content')) {
        closePopup();
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showPopup]);


  const fetchBlockDetails = async () => {
    try {
      setBlockDetails(await alchemy.core.getBlockWithTransactions(blockNumber))
    } catch (error) {
      console.error('Error fetching block details:', error);
    }
  };

  const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const maskAndCopy = (text) => {
    if (text.length > 15) {
      const maskedText = `${text.substring(0, 15)}...`;
      return (
        <span>
          {maskedText}
          <button
            className="copy-button"
            onClick={() => copyToClipboard(text)}
          >
            Copy
          </button>
        </span>
      );
    } else {
      return text;
    }
  };


  const fetchPopupData = async (transaction) => {
    try {
      setJsonData(transaction);
      setShowPopup(true);
    } catch (error) {
      console.error('Error fetching JSON data:', error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setJsonData(null);
  };


  const parsetoInt = (value) => {
    const decimaleConvert = parseInt(value._hex, 16)
    return (decimaleConvert / 1e18).toFixed(6);
  }


    
  return (

    <div className="container">
      <h1 className="title">Block Explorer</h1>
      <div className="button-container">
        <label>Block Number: <i className="blockNumber">{blockNumber}</i></label>
      </div>
      <br/>
        <div className="button-container">
        <button className="button" onClick={fetchBlockDetails}>
          Get Block Details 
        </button>
      </div>
 
      {blockDetails && (
        <div className="block-details">
          <h2>Block Details</h2>
          <p><b>Block ID: </b>{maskAndCopy(blockDetails.hash)}</p>
          <p><b>Block Height: </b>{blockDetails.number}</p>
          <p><b>Block Timestamp: </b>{blockDetails.timestamp}</p>

      <div className="transactions">
      <h2>Transactions</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Hash</th>
            <th>From</th>
            <th>Amount</th>
            <th>To</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {blockDetails.transactions
            .slice(
              (currentPage - 1) * transactionsPerPage,
              currentPage * transactionsPerPage
            )
            .map((transaction) => (
              <tr key={transaction.hash}>
                <td>
                {maskAndCopy(transaction.hash)}
                </td>
                <td>{maskAndCopy(transaction.from)}</td>
                <td>{parsetoInt(transaction.value)}</td>
                <td>{maskAndCopy(transaction.to)}</td>
                <td><a href="#" className="transaction-json" onClick={() => fetchPopupData(transaction)}>See more</a></td>
              </tr>
            ))}
        </tbody> 
            </table>
            {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={() => setShowPopup(false)}>
                  Close
                </button>
                  <div className="json-content">
                  <JSONPretty theme={JSONPrettyMon} data={jsonData}></JSONPretty>
                </div>
                    </div>
                  </div>
              )}
      </div>

      <div className="transactions">
      
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous Page
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={
            currentPage * transactionsPerPage >=
            blockDetails.transactions.length
          }
        >
          Next Page
        </button>
      </div>
    </div>

        </div>
      )}


    </div>

  )
}

export default App;
