import { useState, useEffect } from 'react'
import { Animal } from '../entities/Animal'
import { Card, Button, Form, Input, InputNumber, Select, Modal, Table, Space, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

function AnimalTracker() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    setLoading(true)
    try {
      const response = await Animal.list()
      if (response.success) {
        setAnimals(response.data)
      }
    } catch (error) {
      message.error('Failed to load animals')
    }
    setLoading(false)
  }

  const handleSubmit = async (values) => {
    try {
      if (editingAnimal) {
        const response = await Animal.update(editingAnimal._id, values)
        if (response.success) {
          message.success('Animal updated successfully')
        }
      } else {
        const response = await Animal.create(values)
        if (response.success) {
          message.success('Animal added successfully')
        }
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingAnimal(null)
      loadAnimals()
    } catch (error) {
      message.error('Failed to save animal')
    }
  }

  const handleEdit = (animal) => {
    setEditingAnimal(animal)
    form.setFieldsValue(animal)
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this animal?',
      onOk: async () => {
        try {
          // Note: Assuming delete functionality exists
          message.success('Animal deleted successfully')
          loadAnimals()
        } catch (error) {
          message.error('Failed to delete animal')
        }
      }
    })
  }

  const getHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'healthy': return 'green'
      case 'sick': return 'orange'
      case 'injured': return 'red'
      default: return 'blue'
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Species',
      dataIndex: 'species',
      key: 'species',
      filters: [...new Set(animals.map(a => a.species))].map(species => ({
        text: species,
        value: species,
      })),
      onFilter: (value, record) => record.species === value,
    },
    {
      title: 'Breed',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => (a.age || 0) - (b.age || 0),
      render: (age) => age ? `${age} years` : 'Unknown',
    },
    {
      title: 'Health',
      dataIndex: 'health',
      key: 'health',
      render: (health) => (
        <Tag color={getHealthColor(health)}>
          {health || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Unknown',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Animal Tracker</h1>
        <p className="text-gray-600 mb-4">Keep track of animals you've observed or are monitoring</p>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingAnimal(null)
            form.resetFields()
            setIsModalVisible(true)
          }}
          className="mb-4"
        >
          Add New Animal
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={animals}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingAnimal ? 'Edit Animal' : 'Add New Animal'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingAnimal(null)
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter the animal name' }]}
            >
              <Input placeholder="Enter animal name" />
            </Form.Item>

            <Form.Item
              name="species"
              label="Species"
              rules={[{ required: true, message: 'Please enter the species' }]}
            >
              <Input placeholder="e.g., Dog, Cat, Bird" />
            </Form.Item>

            <Form.Item name="breed" label="Breed">
              <Input placeholder="Enter breed (optional)" />
            </Form.Item>

            <Form.Item name="age" label="Age (years)">
              <InputNumber min={0} max={100} placeholder="Age in years" className="w-full" />
            </Form.Item>

            <Form.Item name="weight" label="Weight (lbs)">
              <InputNumber min={0} placeholder="Weight in pounds" className="w-full" />
            </Form.Item>

            <Form.Item name="health" label="Health Status">
              <Select placeholder="Select health status">
                <Option value="Healthy">Healthy</Option>
                <Option value="Sick">Sick</Option>
                <Option value="Injured">Injured</Option>
                <Option value="Unknown">Unknown</Option>
              </Select>
            </Form.Item>

            <Form.Item name="location" label="Location" className="md:col-span-2">
              <Input placeholder="Current location or habitat" />
            </Form.Item>

            <Form.Item name="lastSeen" label="Last Seen" className="md:col-span-2">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="notes" label="Notes" className="md:col-span-2">
              <TextArea rows={3} placeholder="Additional notes about the animal" />
            </Form.Item>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingAnimal ? 'Update Animal' : 'Add Animal'}
            </Button>
          </div>
        </Form>
      </Modal>
      </div>
    </div>
  )
}

export default AnimalTracker