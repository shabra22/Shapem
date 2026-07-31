// GieesK Recipes Recipe API — Netlify Function
// Endpoint: /.netlify/functions/recipes
// Usage:
//   GET /recipes           → all recipes
//   GET /recipes?id=KEN001 → single recipe
//   GET /recipes?country=Kenya → filter by country
//   GET /recipes?tag=vegan → filter by tag
//   GET /recipes?q=ugali   → search by keyword

const recipesData = require('../../recipes.json');

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=3600'
  };

  const params = event.queryStringParameters || {};
  let recipes = recipesData.recipes;

  // Filter by id
  if (params.id) {
    const recipe = recipes.find(r => r.id === params.id.toUpperCase());
    if (!recipe) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Recipe not found', id: params.id })
      };
    }
    return { statusCode: 200, headers, body: JSON.stringify(recipe) };
  }

  // Filter by country
  if (params.country) {
    recipes = recipes.filter(r =>
      (r.country || '').toLowerCase() === params.country.toLowerCase()
    );
  }

  // Filter by cuisine
  if (params.cuisine) {
    recipes = recipes.filter(r =>
      (r.cuisine || '').toLowerCase().includes(params.cuisine.toLowerCase())
    );
  }

  // Filter by tag
  if (params.tag) {
    recipes = recipes.filter(r =>
      (r.tags || []).includes(params.tag.toLowerCase())
    );
  }

  // Filter by category
  if (params.category) {
    recipes = recipes.filter(r =>
      (r.category || '').toLowerCase().includes(params.category.toLowerCase())
    );
  }

  // Filter by difficulty
  if (params.diff) {
    recipes = recipes.filter(r =>
      (r.diff || '').toLowerCase() === params.diff.toLowerCase()
    );
  }

  // Search by keyword
  if (params.q) {
    const q = params.q.toLowerCase();
    recipes = recipes.filter(r =>
      (r.title || '').toLowerCase().includes(q) ||
      (r.desc || '').toLowerCase().includes(q) ||
      (r.localName || '').toLowerCase().includes(q) ||
      (r.cuisine || '').toLowerCase().includes(q) ||
      (r.country || '').toLowerCase().includes(q) ||
      (r.keywords || []).some(k => k.includes(q))
    );
  }

  // Pagination
  const page  = parseInt(params.page)  || 1;
  const limit = parseInt(params.limit) || 50;
  const start = (page - 1) * limit;
  const paginated = recipes.slice(start, start + limit);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      total: recipes.length,
      page,
      limit,
      pages: Math.ceil(recipes.length / limit),
      recipes: paginated
    })
  };
};
