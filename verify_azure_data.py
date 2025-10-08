import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def verify_data():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    print(f"🔍 Verifying data in Azure Cosmos DB...")
    print(f"📦 Database: {db_name}\n")
    
    try:
        # Create client
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=10000)
        db = client[db_name]
        
        # Check all collections
        collections = await db.list_collection_names()
        
        if not collections:
            print("⚠️  No collections found - database is empty")
            client.close()
            return
        
        print(f"✅ Found {len(collections)} collection(s):\n")
        
        for coll_name in collections:
            collection = db[coll_name]
            count = await collection.count_documents({})
            
            print(f"📚 Collection: {coll_name}")
            print(f"   Documents: {count}")
            
            # Show sample documents
            if count > 0:
                cursor = collection.find().limit(3)
                docs = await cursor.to_list(length=3)
                
                for i, doc in enumerate(docs, 1):
                    # Remove _id for cleaner display
                    doc_copy = {k: v for k, v in doc.items() if k != '_id'}
                    
                    # Truncate long content
                    if 'content' in doc_copy and len(str(doc_copy['content'])) > 100:
                        doc_copy['content'] = str(doc_copy['content'])[:100] + '...'
                    
                    print(f"   Sample {i}: {list(doc_copy.keys())}")
            
            print()
        
        print("✅ Azure Cosmos DB verification complete!")
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(verify_data())
