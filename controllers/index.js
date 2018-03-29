let express = require('express'),
    router = express.Router();

//Load controllers
let AddressCtrl = require('./AddressCtrl.js'),
    BlockCtrl = require('./BlockCtrl.js'),
    PricingCtrl = require('./PricingCtrl.js'),
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
    longCacheSuccess = cache('5 minutes', onlyStatus200),
    mediumCacheSuccess = cache('1 minutes', onlyStatus200),
    shortCacheSuccess = cache('20 seconds', onlyStatus200);

/**
 * Get information on an address.
 * @route GET /tx/{hash}
 * @param {string} hash.path.required - Transaction hash
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction details
 */
router.get('/tx/:hash', longCacheSuccess, TxCtrl.FetchTx);

/**
 * Get information on an address.
 * @route GET /address/info/{address}
 * @param {string} address.path.required - address
 * @group address - Operations about addresses
 * @returns {object} 200 - Address details
 */
router.get('/address/info/:address', mediumCacheSuccess, AddressCtrl.Info);

/**
 * Get the transactions of an address.
 * @route GET /address/txs/{address}
 * @param {string} address.path.required - address
 * @param {string} page.query.optional - page
 * @param {string} items_per_page.query.optional - items per page
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
 * @group general - General operations
 * @returns {object} 200 - List of assets
 */
router.get('/assets', longCacheSuccess, AssetCtrl.ListAllAssets);

/**
 * This function returns number of coins in circulation.
 * @route GET /circulation
 * @group general - General operations
 * @returns {object} 200 - Number of coins
 */
router.get('/circulation', mediumCacheSuccess, BlockCtrl.FetchCirculation);

/**
 * This function returns the pricing information.
 * @route GET /pricing
 * @group general - General operations
 * @returns {object} 200 - Pricing info
 */
router.get('/pricing', mediumCacheSuccess, PricingCtrl.tickers);

router.get('/inouts', shortCacheSuccess, AddressCtrl.listInOuts);
router.get('/mining', longCacheSuccess, MiningCtrl.info);
router.get('/part-of-cake', longCacheSuccess, MiningCtrl.partofcake);

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

exports.routes = router;
