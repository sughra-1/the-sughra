// Search with Autocomplete
const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    useEffect(() => {
      if (query.length >= 2) {
        fetch(`/api/search/suggestions?q=${query}`)
          .then(res => res.json())
          .then(data => setSuggestions(data))
          .catch(err => console.error(err));
      } else {
        setSuggestions([]);
      }
    }, [query]);
    
    return (
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setQuery(item.name);
                  setShowSuggestions(false);
                }}
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };