const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(session({
  secret: 'jordan-secret',
  resave: false,
  saveUninitialized: true
}));

const shoes = [
  {
    id: 1,
    name: "Air Jordan 1 High OG 'Chicago'",
    price: 180,
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500",
    description: "The iconic Air Jordan 1 in classic Chicago colors",
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    color: "White/Black-Varsity Red",
    releaseDate: "2023-10-15",
    rating: 4.8,
    reviews: [
      { user: "MikeB", rating: 5, comment: "Perfect fit and amazing quality!" },
      { user: "JordanFan23", rating: 4.5, comment: "Classic colorway, runs true to size" }
    ],
    features: [
      "Full-grain leather upper",
      "Air-Sole unit in heel",
      "Rubber outsole",
      "Wings logo on collar",
      "Nike Air branding"
    ]
  },
  {
    id: 2,
    name: "Air Jordan 4 Retro 'Thunder'",
    price: 200,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
    description: "Retro Jordan 4 with premium materials",
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    color: "Black/Tour Yellow",
    releaseDate: "2023-12-01",
    rating: 4.7,
    reviews: [
      { user: "SneakerHead", rating: 5, comment: "These are fire! Must cop!" },
      { user: "J4Collector", rating: 4.5, comment: "Great quality, but runs slightly big" }
    ],
    features: [
      "Premium nubuck upper",
      "Visible Air unit",
      "Mesh panels",
      "Classic Flight tongue logo",
      "TPU wings"
    ]
  },
  {
    id: 3,
    name: "Air Jordan 11 'Space Jam'",
    price: 220,
    image: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=500",
    description: "Patent leather classic Jordan 11",
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    color: "Black/Concord-White",
    releaseDate: "2023-11-15",
    rating: 4.9,
    reviews: [
      { user: "SpaceJamFan", rating: 5, comment: "Just like the movie! Perfect!" },
      { user: "AirJordan", rating: 5, comment: "Best Jordan 11 colorway ever" }
    ],
    features: [
      "Patent leather mudguard",
      "Ballistic mesh upper",
      "Carbon fiber spring plate",
      "Full-length Air-Sole unit",
      "Iconic Jumpman logo"
    ]
  }
];

app.get('/api/shoes', (req, res) => {
  res.json(shoes);
});

app.get('/api/shoes/:id', (req, res) => {
  const shoe = shoes.find(s => s.id === parseInt(req.params.id));
  if (shoe) {
    res.json(shoe);
  } else {
    res.status(404).json({ error: 'Shoe not found' });
  }
});

app.get('/api/cart', (req, res) => {
  res.json(req.session.cart || []);
});

app.post('/api/cart', (req, res) => {
  const { shoeId, size } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  
  const shoe = shoes.find(s => s.id === shoeId);
  if (shoe) {
    req.session.cart.push({
      ...shoe,
      cartId: Date.now(),
      size
    });
    res.json(req.session.cart);
  } else {
    res.status(404).json({ error: 'Shoe not found' });
  }
});

app.delete('/api/cart/:cartId', (req, res) => {
  const { cartId } = req.params;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.cartId !== parseInt(cartId));
    res.json(req.session.cart);
  } else {
    res.status(404).json({ error: 'Cart not found' });
  }
});

app.post('/api/checkout', (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }
  
  req.session.cart = [];
  res.json({ message: 'Order placed successfully!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});