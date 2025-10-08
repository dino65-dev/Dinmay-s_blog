import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def test_connection():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    print(f"Testing connection to Azure Cosmos DB...")
    print(f"Database name: {db_name}")
    
    try:
        # Create client
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=10000)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to Azure Cosmos DB!")
        
        # Get database
        db = client[db_name]
        
        # List collections
        collections = await db.list_collection_names()
        print(f"\n📚 Collections in database '{db_name}':")
        if collections:
            for coll in collections:
                count = await db[coll].count_documents({})
                print(f"  - {coll}: {count} documents")
        else:
            print("  (No collections yet - database is empty)")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
