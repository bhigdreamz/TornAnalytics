#!/usr/bin/env python3
"""
Fetch active trader IDs from TornExchange API and save them to a file
"""
import requests
import json
import time
from datetime import datetime

def fetch_active_traders():
    """Fetch active traders from TornExchange API"""
    url = "https://www.tornexchange.com/api/active_traders"
    
    try:
        print("Fetching active traders from TornExchange...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract trader IDs from the nested structure
        trader_ids = []
        traders_data = data.get('data', {}).get('verbose', {})
        
        for trader_id, trader_info in traders_data.items():
            trader_ids.append({
                'id': int(trader_id),
                'name': trader_info.get('name', ''),
                'last_trade': trader_info.get('last_trade', 0)
            })
        
        print(f"Successfully fetched {len(trader_ids)} active traders")
        return trader_ids
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return []

def save_trader_ids(trader_ids, filename='trader_ids.json'):
    """Save trader IDs to a JSON file"""
    try:
        # Create a summary with metadata
        output_data = {
            'fetched_at': datetime.now().isoformat(),
            'total_traders': len(trader_ids),
            'traders': trader_ids
        }
        
        with open(filename, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"Saved {len(trader_ids)} trader IDs to {filename}")
        
        # Also save just the IDs in a simple text file for easy use
        ids_only_file = 'trader_ids.txt'
        with open(ids_only_file, 'w') as f:
            for trader in trader_ids:
                f.write(f"{trader['id']}\n")
        
        print(f"Also saved IDs only to {ids_only_file}")
        
    except Exception as e:
        print(f"Error saving file: {e}")

def main():
    print("TornExchange Active Traders Fetcher")
    print("===================================")
    
    # Fetch the trader data
    trader_ids = fetch_active_traders()
    
    if trader_ids:
        # Save to files
        save_trader_ids(trader_ids)
        
        # Show some stats
        print(f"\nStats:")
        print(f"- Total active traders: {len(trader_ids)}")
        
        # Show most recent traders (sorted by last_trade)
        recent_traders = sorted(trader_ids, key=lambda x: x['last_trade'], reverse=True)[:10]
        print(f"\nMost recently active traders:")
        for trader in recent_traders:
            last_trade_time = datetime.fromtimestamp(trader['last_trade']).strftime('%Y-%m-%d %H:%M:%S')
            print(f"- {trader['name']} (ID: {trader['id']}) - Last trade: {last_trade_time}")
    else:
        print("No trader data was fetched.")

if __name__ == "__main__":
    main()