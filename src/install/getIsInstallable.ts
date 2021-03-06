import installChecks = require('pnpm-install-checks')
import logger from 'pnpm-logger'
import {Package} from '../types'
import pnpmPkg from '../pnpmPkgJson'
import {FetchedPackage} from './fetch'

const installCheckLogger = logger('install-check')

export default async function getIsInstallable (
  pkgId: string,
  pkg: Package,
  fetchedPkg: FetchedPackage,
  options: {
    optional: boolean,
    engineStrict: boolean,
    nodeVersion: string,
  }
): Promise<boolean> {
  const warn = await installChecks.checkPlatform(pkg) || await installChecks.checkEngine(pkg, {
    pnpmVersion: pnpmPkg.version,
    nodeVersion: options.nodeVersion
  })

  if (!warn) return true

  installCheckLogger.warn(warn)

  if (!options.engineStrict && !options.optional) return true

  await fetchedPkg.abort()

  if (!options.optional) throw warn

  logger.warn({
    message: `Skipping failed optional dependency ${pkgId}`,
    warn,
  })

  return false
}
