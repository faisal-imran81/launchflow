import {
  launchInstance,
  describeInstance,
  listInstances,
} from '../services/ec2Service.js'

/**
 * POST /api/ec2/launch
 * Body: { name: string, ami?: string, instanceType?: string, keyPairName?: string, securityGroupId?: string }
 */
export async function handleLaunchInstance(req, res, next) {
  const { name, ami, instanceType, keyPairName, securityGroupId } = req.body ?? {}

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required and must be a string' })
  }

  try {
    const result = await launchInstance({ name, ami, instanceType, keyPairName, securityGroupId })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * GET /api/ec2/instances/:id
 */
export async function handleDescribeInstance(req, res, next) {
  const { id } = req.params

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Instance id param is required' })
  }

  try {
    const result = await describeInstance(id)
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * GET /api/ec2/instances
 */
export async function handleListInstances(req, res, next) {
  try {
    const instances = await listInstances()
    return res.status(200).json({ ok: true, instances })
  } catch (err) {
    return next(err)
  }
}
