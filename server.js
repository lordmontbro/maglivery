const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// Helper function to load codes from CODES.txt
function getPromoCodes() {
  const codes = {};
  if (!fs.existsSync('CODES.txt')) return codes;

  const lines = fs.readFileSync('CODES.txt', 'utf8').split('\n');
  lines.forEach(line => {
    const [code, discount] = line.trim().split(',');
    if (code && discount) {
      codes[code.toUpperCase()] = parseFloat(discount);
    }
  });
  return codes;
}

// Checkout endpoint
app.post('/api/checkout', (req, res) => {
  const { code, cartTotal } = req.body;
  const promoCodes = getPromoCodes();
  
  const formattedCode = code ? code.trim().toUpperCase() : '';

  if (formattedCode && promoCodes[formattedCode]) {
    const discountPercent = promoCodes[formattedCode];
    const discountAmount = (cartTotal * discountPercent) / 100;
    const finalTotal = cartTotal - discountAmount;

    return res.json({
      success: true,
      validCode: true,
      discountPercent,
      discountAmount,
      finalTotal
    });
  }

  // If no valid code provided, process full price
  res.json({
    success: true,
    validCode: false,
    finalTotal: cartTotal,
    message: formattedCode ? 'Invalid promo code' : 'No promo code applied'
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
