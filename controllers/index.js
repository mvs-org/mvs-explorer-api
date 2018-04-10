let express = require('express'),
    router = express.Router();

//Load controllers
let AddressCtrl = require('./AddressCtrl.js'),
    BlockCtrl = require('./BlockCtrl.js'),
    PricingCtrl = require('./PricingCtrl.js'),
    SearchCtrl = require('./SearchCtrl.js'),
    MiningCtrl = require('./MiningCtrl.js'),
    GeoCtrl = require('./GeoCtrl.js'),
    FullnodeCtrl = require('./FullnodeCtrl.js'),
    TxCtrl = require('./TxCtrl.js'),
    AssetCtrl = require('./AssetCtrl.js');

//Caching
let apicache = require('apicache'),
    redis = require('redis'),
    redis_config = require('../config/redis.js'),
    cache = apicache
    .options({
        redisClient: (redis_config.enabled) ? redis.createClient(redis_config.config) : undefined
    })
    .middleware;
//Define cache rules to only cache if result was successfull
const onlyStatus200 = (req, res) => res.statusCode === 200,
    hourCacheSuccess = cache('60 minutes', onlyStatus200),
    longCacheSuccess = cache('5 minutes', onlyStatus200),
    mediumCacheSuccess = cache('1 minutes', onlyStatus200),
    shortCacheSuccess = cache('20 seconds', onlyStatus200);

/**
 * Get information on a transaction.
 * @route GET /tx/{hash}
 * @param {string} hash.path.required - Transaction hash
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction details
 */
router.get('/tx/:hash', longCacheSuccess, TxCtrl.FetchTx);

/**
 * Search for transaction hash.
 * @route GET /suggest/tx/{prefix}
 * @param {string} prefix.path.required - Transaction hash prefix
 * @param {number} limit.query.required - Number of results
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction details
 */
router.get('/suggest/tx/:prefix', mediumCacheSuccess, TxCtrl.Suggest);

/**
 * Get information on an address.
 * @route GET /address/info/{address}
 * @param {string} address.path.required - address
 * @group address - Operations about addresses
 * @returns {object} 200 - Address details
 */
router.get('/address/info/:address', shortCacheSuccess, AddressCtrl.ListBalances);

/**
 * Search for addresses.
 * @route GET /suggest/address/{prefix}
 * @param {string} prefix.path.required - Address prefix
 * @param {number} limit.query.required - Number of results
 * @group address - Operations about addresses
 * @returns {object} 200 - Address suggestion
 */
router.get('/suggest/address/:prefix', AddressCtrl.Suggest);

/**
 * Get the transactions of an address.
 * @route GET /address/txs/{address}
 * @param {string} address.path.required - address
 * @param {string} page.query.optional - page
 * @param {string} items_per_page.query.optional - items per page
 * @param {number} from.query.optional - From timestamp
 * @param {number} from.query.optional - To timestamp
 * @group address - Operations about addresses
 * @returns {object} 200 - Transaction array
 */
router.get('/address/txs/:address', mediumCacheSuccess, AddressCtrl.ListTxs);
router.get('/address/:address', mediumCacheSuccess, AddressCtrl.ListTxs);

/**
 * Get latest block number.
 * @route GET /height
 * @group block - Operations about blocks
 * @returns {object} 200 - Latest block number
 */
router.get('/height', shortCacheSuccess, BlockCtrl.FetchHeight);

/**
 * List blocks.
 * @route GET /blocks/{page}
 * @group block - Operations about blocks
 * @param {number} page.path.required - page
 * @returns {object} 200 - Block data
 */
router.get('/blocks/:page', shortCacheSuccess, BlockCtrl.ListBlocks);

/**
 * Search for block hashes by given prefix.
 * @route GET /suggest/blocks/{prefix}
 * @group block - Operations about blocks
 * @param {string} prefix.path.required - Prefix
 * @param {number} limit.query.required - Number of results
 * @returns {object} 200 - Block data
 */
router.get('/suggest/blocks/:prefix', shortCacheSuccess, BlockCtrl.Suggest);

/**
 * Get the specified block.
 * @route GET /block/{block_no}
 * @group block - Operations about blocks
 * @param {number} block_no.path.required - block number
 * @returns {object} 200 - Block data
 */
router.get('/block/:block_no', longCacheSuccess, BlockCtrl.Fetch);

/**
 * This function returns the list of all the assets.
 * @route GET /assets
 * @group general - Asset operations
 * @returns {object} 200 - List of assets
 */
router.get('/assets', longCacheSuccess, AssetCtrl.ListAllAssets);

/**
 * This function returns the list of all the asset names that start with given prefix.
 * @route GET /suggest/asset/{prefix}
 * @group general - Asset operations
 * @returns {object} 200 - Search for assets
 */
router.get('/suggest/asset/:prefix', mediumCacheSuccess, AssetCtrl.Search);

/**
 * This function returns the information about a specific asset.
 * @route GET /asset/{asset_name}
 * @group general - Asset operations
 * @returns {object} 200 - Asset info
 */
router.get('/asset/:asset_symbol', longCacheSuccess, AssetCtrl.AssetInfo);

/**
 * This function returns number of coins in circulation.
 * @route GET /circulation
 * @group general - General operations
 * @returns {object} 200 - Number of coins
 */
router.get('/circulation', hourCacheSuccess, BlockCtrl.FetchCirculation);

/**
 * This function returns the pricing information.
 * @route GET /pricing
 * @group general - General operations
 * @returns {object} 200 - Pricing info
 */
router.get('/pricing', mediumCacheSuccess, PricingCtrl.tickers);

router.get('/mining', shortCacheSuccess, MiningCtrl.info);
router.get('/poolstats', longCacheSuccess, MiningCtrl.poolstats);

/**
 * This function returns the sum of add deposited ETP.
 * @route GET /depositsum
 * @group general - General operations
 * @returns {object} 200 - Deposit sum
 */
router.get('/depositsum', mediumCacheSuccess, TxCtrl.LockSum);

/**
 * This function returns the total amount of rewards from ETP deposits.
 * @route GET /rewards
 * @group general - General operations
 * @returns {object} 200 - Deposit rewards
 */
router.get('/rewards', shortCacheSuccess, TxCtrl.Rewards);

/**
 * This function returns version information on the fullnode wallet.
 * @route GET /fullnode/version
 * @group general - General operations
 * @returns {object} 200 - Fullnode version
 */
router.get('/fullnode/version', mediumCacheSuccess, FullnodeCtrl.version);

router.get('/locations', mediumCacheSuccess, GeoCtrl.locations);

/**
 * Search for transactions, blocks, addresses and assets by given prefix.
 * @route GET /suggest/all/{prefix}
 * @param {string} prefix.path.required - Target prefix
 * @param {number} limit.query.required - Number of result for each group
 * @group general - General operations
 * @returns {object} 200 - Suggestion list
 */
router.get('/suggest/all/:prefix', SearchCtrl.Suggest);

exports.routes = router;
