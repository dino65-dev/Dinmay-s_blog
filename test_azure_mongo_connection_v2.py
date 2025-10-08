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
    print(f"Connection string: {mongo_url[:50]}...")
    
    try:
        # Create client with additional options for Azure Cosmos DB
        client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            retryWrites=False,
            tls=True,
            tlsAllowInvalidCertificates=False
        )
        
        # Test connection
        print("\nAttempting to ping database...")
        result = await client.admin.command('ping')
        print(f"✅ Successfully connected to Azure Cosmos DB! Ping result: {result}")
        
        # Get database
        db = client[db_name]
        
        # List collections
        print(f"\n📚 Listing collections in database '{db_name}'...")
        collections = await db.list_collection_names()
        if collections:
            print(f"Found {len(collections)} collections:")
            for coll in collections:
                count = await db[coll].count_documents({})
                print(f"  - {coll}: {count} documents")
        else:
            print("  (No collections yet - database is empty)")
        
        # Close connection
        client.close()
        print("\n✅ Connection test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Connection failed: {str(e)}")
        print(f"\nError type: {type(e).__name__}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
